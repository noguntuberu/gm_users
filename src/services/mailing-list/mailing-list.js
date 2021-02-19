/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/
//
const RootService = require('../_root');
const MailingListController = require('../../controllers/mailing-list');
const MailingListModel = require('../../models/mailing-list');
const { ListContactSchema, MailingListSchema } = require('../../schemas/mailing-list');

const {
    build_query,
    build_wildcard_options
} = require('../../utilities/query');

class MailingListService extends RootService {
    constructor(
        mailingList_controller
    ) {
        super();
        this.mailingList_controller = mailingList_controller;
    }

    async add_contacts(request, next) {
        try {
            const { body, tenant_id } = request;
            const { error } = ListContactSchema.validate(body);

            if (error) throw new Error(error);

            const { id } = request.params;
            const { contacts } = body;
            const formatted_contacts_for_db = contacts.map(contact => ({
                id: contact,
            }));

            const result = await this.mailingList_controller.update_records({ id, tenant_id }, {
                $addToSet: { contacts: { $each: [...formatted_contacts_for_db] } },
            });
            return this.process_update_result(result);
        } catch (e) {
            const err = this.process_failed_response(`[MailingListService] add_contacts: ${e.message}`, 500);
            next(err);
        }
    }

    async create_record(request, next) {
        try {
            const { body } = request;
            const { error } = MailingListSchema.validate(body);

            if (error) throw new Error(error);

            const result = await this.mailingList_controller.create_record({ ...body });
            return this.process_single_read(result);
        } catch (e) {
            const err = this.process_failed_response(`[MailingListService] created_record: ${e.message}`, 500);
            next(err);
        }
    }

    async read_record_by_id(request, next) {
        try {
            const { tenant_id } = request;
            const { id } = request.params;
            if (!id) return next(this.process_failed_response(`Invalid ID supplied.`));

            const result = await this.mailingList_controller.read_records({ id, ...this.standard_query_meta, tenant_id });
            return this.process_single_read(result[0]);
        } catch (e) {
            const err = this.process_failed_response(`[MailingListService] update_record_by_id: ${e.message}`, 500);
            return next(err);
        }
    }

    async read_records_by_filter(request, next) {
        try {
            const { query, tenant_id } = request;

            const result = await this.handle_database_read(this.mailingList_controller, query, { ...this.standard_query_meta, tenant_id });
            return this.process_multiple_read_results(result);
        } catch (e) {
            const err = this.process_failed_response(`[MailingListService] read_records_by_filter: ${e.message}`, 500);
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
            const result = await this.handle_database_read(this.mailingList_controller, query, {
                ...wildcard_conditions,
                ...this.standard_query_meta,
                tenant_id,
            });
            return this.process_multiple_read_results(result);
        } catch (e) {
            const err = this.process_failed_response(`[MailingListService] read_records_by_wildcard: ${e.message}`, 500);
            next(err);
        }
    }

    async update_record_by_id(request, next) {
        try {
            const { tenant_id } = request;
            const { id } = request.params;
            const data = request.body;

            if (!id) return next(this.process_failed_response(`Invalid ID supplied.`));

            const result = await this.mailingList_controller.update_records({ id, tenant_id }, { ...data });
            return this.process_update_result(result);
        } catch (e) {
            const err = this.process_failed_response(`[MailingListService] update_record_by_id: ${e.message}`, 500);
            next(err);
        }
    }

    async update_records(request, next) {
        try {
            const { tenant_id } = request;
            const { options, data } = request.body;
            const { seek_conditions } = build_query(options);

            const result = await this.mailingList_controller.update_records({ ...seek_conditions, tenant_id }, { ...data });
            return this.process_update_result({ ...data, ...result });
        } catch (e) {
            const err = this.process_failed_response(`[MailingListService] update_records: ${e.message}`, 500);
            next(err);
        }
    }

    async delete_contacts(request, next) {
        try {
            const { body, tenant_id } = request;
            const { error } = ListContactSchema.validate(body);

            if (error) throw new Error(error);

            const { id } = request.params;
            const { contacts } = body;

            TODO: 'how can we use a controller here?'
            const result = await MailingListModel.updateMany({}, {
                $set: {
                    "contacts.$[element].time_removed": new Date(),
                    "contacts.$[element].is_active": false,
                },
            }, {
                multi: true,
                arrayFilters: [
                    { "element.id": { $in: [...contacts] } },
                    { id, tenant_id, }
                ],
            });
            return this.process_update_result(result);
        } catch (e) {
            const err = this.process_failed_response(`[MailingListService] delete_contacts: ${e.message}`, 500);
            next(err);
        }
    }

    async delete_record_by_id(request, next) {
        try {
            const { tenant_id } = request;
            const { id } = request.params;
            if (!id) return next(this.process_failed_response(`Invalid ID supplied.`));

            const result = await this.mailingList_controller.delete_records({ id, tenant_id });
            return this.process_delete_result(result);
        } catch (e) {
            const err = this.process_failed_response(`[MailingListService] delete_record_by_id: ${e.message}`, 500);
            next(err);
        }
    }

    async delete_records(request, next) {
        try {
            const { tenant_id } = request;
            const { options } = request.body;
            const { seek_conditions } = build_query(options);

            const result = await this.mailingList_controller.delete_records({ ...seek_conditions, tenant_id });
            return this.process_delete_result({ ...result });
        } catch (e) {
            const err = this.process_failed_response(`[MailingListService] delete_records: ${e.message}`, 500);
            next(err);
        }
    }
}

module.exports = new MailingListService(MailingListController);