/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/
//
const RootService = require('../_root');
const ContactController = require('../../controllers/contact');
const MailingListController = require('../../controllers/mailing-list');
const { SingleContactSchema } = require('../../schemas/contact');
const { ContactCreator, FileReader, MailingListStream } = require('../../utilities/streams');
const { build_query, build_wildcard_options } = require('../../utilities/query');
const contact_events = require('../../events/constants/contacts');

class ContactService extends RootService {
    constructor(
        contact_controller,
        mailing_list_controller,
    ) {
        /** */
        super();

        /** */
        this.contact_controller = contact_controller;
        this.mailing_list_controller = mailing_list_controller;
    }

    async create_record(request, next) {
        try {
            const { body, subscription_id, tenant_id } = request;
            const { error } = SingleContactSchema.validate(body);

            if (error) throw new Error(error);

            delete body.id;
            const result = await this.contact_controller.create_record({ ...body, tenant_id });
            return this.process_single_read(result, {
                event_name: contact_events.created,
                payload: { ...result, subscription_id },
            });
        } catch (e) {
            const err = this.process_failed_response(`[ContactService] created_record: ${e.message}`, 500);
            next(err);
        }
    }

    async create_records_from_file(request, response, next) {
        try {
            const { files, body, subscription_id } = request;
            const limits = {
                size: 5 * 1024 * 1024,
                type: ['text/csv'],
            };

            if (!files) return this.process_failed_response(`No file attached.`);

            const { contacts } = files;
            const { tenant_id, list_id } = body;
            if (!contacts) return this.process_failed_response(`Invalid file`);

            const { data, size, mimetype } = contacts;
            if (size > limits.size) return this.process_failed_response('File too large');
            if (!limits.type.includes(mimetype)) return this.process_failed_response(`Invalid file type`);

            const file_stream = new FileReader(data);
            const contact_upload_stream = new ContactCreator(this.contact_controller, subscription_id, tenant_id);

            if (list_id) {
                const list_update_stream = new MailingListStream(this.mailing_list_controller, list_id);
                file_stream.pipe(contact_upload_stream).pipe(list_update_stream).pipe(response);
            } else {
                file_stream.pipe(contact_upload_stream).pipe(response);
            }
        } catch (e) {
            const err = this.process_failed_response(`[ContactService] created_record: ${e.message}`, 500);
            next(err);
        }
    }

    async read_record_by_id(request, next) {
        try {
            const { id } = request.params;
            const { tenant_id } = request;
            if (!id) return next(this.process_failed_response(`Invalid ID supplied.`));

            const result = await this.contact_controller.read_records({ id, tenant_id, ...this.standard_query_meta });
            return this.process_single_read(result[0]);
        } catch (e) {
            const err = this.process_failed_response(`[ContactService] update_record_by_id: ${e.message}`, 500);
            return next(err);
        }
    }

    async read_records_by_filter(request, next) {
        try {
            const { query, tenant_id } = request;
            const result = await this.handle_database_read(this.contact_controller, query, { ...this.standard_query_meta, tenant_id });
            return this.process_multiple_read_results(result);
        } catch (e) {
            const err = this.process_failed_response(`[ContactService] read_records_by_filter: ${e.message}`, 500);
            next(err);
        }
    }

    async read_records_by_wildcard(request, next) {
        try {
            const { params, query, tenant_id } = request;

            if (!params.keys || !params.keys) {
                return next(this.process_failed_response(`Invalid key/keyword`, 400));
            }

            const wildcard_conditions = build_wildcard_options(params.keys, params.keyword);
            const result = await this.handle_database_read(this.contact_controller, query, {
                ...wildcard_conditions,
                ...this.standard_query_meta,
                tenant_id,
            });
            return this.process_multiple_read_results(result);
        } catch (e) {
            const err = this.process_failed_response(`[ContactService] read_records_by_wildcard: ${e.message}`, 500);
            next(err);
        }
    }

    async update_record_by_id(request, next) {
        try {
            const { tenant_id } = request;
            const { id } = request.params;
            const data = request.body;

            if (!id) return next(this.process_failed_response(`Invalid ID supplied.`));

            const new_data = this.delete_record_metadata(data);
            const result = await this.contact_controller.update_records({ id, tenant_id }, { ...new_data });
            return this.process_update_result({ ...result, ...data });
        } catch (e) {
            const err = this.process_failed_response(`[ContactService] update_record_by_id: ${e.message}`, 500);
            next(err);
        }
    }

    async update_records(request, next) {
        try {
            const { tenant_id } = request;
            const { options, data } = request.body;
            const { seek_conditions } = build_query(options);

            const new_data = this.delete_record_metadata(data);
            const result = await this.contact_controller.update_records({ ...seek_conditions, tenant_id }, { ...new_data });
            return this.process_update_result({ ...new_data, ...result });
        } catch (e) {
            const err = this.process_failed_response(`[ContactService] update_records: ${e.message}`, 500);
            next(err);
        }
    }

    async delete_record_by_id(request, next) {
        try {
            const { tenant_id } = request;
            const { id } = request.params;
            if (!id) return next(this.process_failed_response(`Invalid ID supplied.`));

            const result = await this.contact_controller.delete_records({ id, tenant_id });
            return this.process_delete_result(result);
        } catch (e) {
            const err = this.process_failed_response(`[ContactService] delete_record_by_id: ${e.message}`, 500);
            next(err);
        }
    }

    async delete_records(request, next) {
        try {
            const { tenant_id } = request;
            const { options } = request.body;
            const { seek_conditions } = build_query(options);

            const result = await this.contact_controller.delete_records({ ...seek_conditions, tenant_id });
            return this.process_delete_result({ ...result });
        } catch (e) {
            const err = this.process_failed_response(`[ContactService] delete_records: ${e.message}`, 500);
            next(err);
        }
    }
}

module.exports = new ContactService(ContactController, MailingListController);