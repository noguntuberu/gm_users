/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/
//
const RootService = require('../_root');
const Observable = require('../../utilities/observable');
const ContactController = require('../../controllers/contact');
const MailingListController = require('../../controllers/mailing-list');
const { SingleContactSchema } = require('../../schemas/contact');
const { ContactCreator, FileReader, MailingListStream } = require('../../utilities/streams');
const {
    build_query,
    build_wildcard_options
} = require('../../utilities/query');

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
            const { body } = request;
            const { error } = SingleContactSchema.validate(body);

            if (error) throw new Error(error);

            delete body.id;
            const result = await this.contact_controller.create_record({ ...body });
            return this.process_single_read(result);
        } catch (e) {
            const err = this.process_failed_response(`[ContactService] created_record: ${e.message}`, 500);
            next(err);
        }
    }

    async create_records_from_file(request, response, next) {
        try {
            const { files, body } = request;
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
            const contact_upload_stream = new ContactCreator(this.contact_controller, tenant_id);

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
            if (!id) return next(this.process_failed_response(`Invalid ID supplied.`));

            const result = await this.contact_controller.read_records({ id, ...this.standard_query_meta });
            return this.process_single_read(result[0]);
        } catch (e) {
            const err = this.process_failed_response(`[ContactService] update_record_by_id: ${e.message}`, 500);
            return next(err);
        }
    }

    async read_records_by_filter(request, next) {
        try {
            const { query } = request;

            const result = await this.handle_database_read(this.contact_controller, query, { ...this.standard_query_meta });
            return this.process_multiple_read_results(result);
        } catch (e) {
            const err = this.process_failed_response(`[ContactService] read_records_by_filter: ${e.message}`, 500);
            next(err);
        }
    }

    async read_records_by_wildcard(request, next) {
        try {
            const { params, query } = request;

            if (!params.keys || !params.keys) {
                return next(this.process_failed_response(`Invalid key/keyword`, 400));
            }

            const wildcard_conditions = build_wildcard_options(params.keys, params.keyword);
            const result = await this.handle_database_read(this.contact_controller, query, {
                ...wildcard_conditions, 
                ...this.standard_query_meta, 
            });
            return this.process_multiple_read_results(result);
        } catch (e) {
            const err = this.process_failed_response(`[ContactService] read_records_by_wildcard: ${e.message}`, 500);
            next(err);
        }
    }

    async update_record_by_id(request, next) {
        try {
            const { id } = request.params;
            const data = request.body;

            if (!id) return next(this.process_failed_response(`Invalid ID supplied.`));

            const result = await this.contact_controller.update_records({ id }, { ...data });
            return this.process_update_result(result);
        } catch (e) {
            const err = this.process_failed_response(`[ContactService] update_record_by_id: ${e.message}`, 500);
            next(err);
        }
    }

    async update_records(request, next) {
        try {
            const { options, data } = request.body;
            const { seek_conditions } = build_query(options);

            const result = await this.contact_controller.update_records({ ...seek_conditions }, { ...data });
            return this.process_update_result({ ...data, ...result });
        } catch (e) {
            const err = this.process_failed_response(`[ContactService] update_records: ${e.message}`, 500);
            next(err);
        }
    }

    async delete_record_by_id(request, next) {
        try {
            const { id } = request.params;
            if (!id) return next(this.process_failed_response(`Invalid ID supplied.`));

            const result = await this.contact_controller.delete_records({ id });
            return this.process_delete_result(result);
        } catch (e) {
            const err = this.process_failed_response(`[ContactService] delete_record_by_id: ${e.message}`, 500);
            next(err);
        }
    }

    async delete_records(request, next) {
        try {
            const { options } = request.body;
            const { seek_conditions } = build_query(options);

            const result = await this.contact_controller.delete_records({ ...seek_conditions });
            return this.process_delete_result({ ...result });
        } catch (e) {
            const err = this.process_failed_response(`[ContactService] delete_records: ${e.message}`, 500);
            next(err);
        }
    }
}

module.exports = new ContactService(ContactController, MailingListController);