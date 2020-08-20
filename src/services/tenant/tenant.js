/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/
//
const RootService = require('../_root');
const Observabble = require('../../utilities/observable');
const TenantController = require('../../controllers/tenant');
const TenantSchema = require('../../schemas/tenant');

const {
    build_query,
    build_wildcard_options
} = require('../../utilities/query');

class TenantService extends RootService {
    constructor(
        tenant_controller
    ) {
        super();

        this.tenant_controller = tenant_controller;
    }

    async read_record_by_id(request, next) {
        try {
            const { id } = request.params;
            if (!id) return next(this.process_failed_response(`Invalid ID supplied.`));

            const result = await this.tenant_controller.read_records({ id, is_active: true });
            return this.process_single_read(result[0]);
        } catch (e) {
            const err = this.process_failed_response(`[TenantService] update_record_by_id: ${e.message}`, 500);
            return next(err);
        }
    }

    async read_records_by_filter(request, next) {
        try {
            const { query } = request;

            const result = await this.handle_database_read(this.tenant_controller, query);
            return this.process_multiple_read_results(result);
        } catch (e) {
            const err = this.process_failed_response(`[TenantService] read_records_by_filter: ${e.message}`, 500);
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
            const result = await this.handle_database_read(this.tenant_controller, query, wildcard_conditions);
            return this.process_multiple_read_results(result);
        } catch (e) {
            const err = this.process_failed_response(`[TenantService] read_records_by_wildcard: ${e.message}`, 500);
            next(err);
        }
    }

    async update_record_by_id(request, next) {
        try {
            const { id } = request.params;
            const data = this.delete_record_metadata(request.body);

            if (!id) return next(this.process_failed_response(`Invalid ID supplied.`));

            const result = await this.tenant_controller.update_records({ id }, { ...data });
            return this.process_update_result(result);
        } catch (e) {
            const err = this.process_failed_response(`[TenantService] update_record_by_id: ${e.message}`, 500);
            next(err);
        }
    }

    async update_records(request, next) {
        try {
            const { options, data } = request.body;
            const update_data = this.delete_record_metadata(data);
            const { seek_conditions } = build_query(options);

            const result = await this.tenant_controller.update_records({ ...seek_conditions }, { ...update_data });
            return this.process_update_result({ ...data, ...result });
        } catch (e) {
            const err = this.process_failed_response(`[TenantService] update_records: ${e.message}`, 500);
            next(err);
        }
    }

    async delete_record_by_id(request, next) {
        try {
            const { id } = request.params;
            if (!id) return next(this.process_failed_response(`Invalid ID supplied.`));

            const result = await this.tenant_controller.delete_records({ id });
            return this.process_delete_result(result);
        } catch (e) {
            const err = this.process_failed_response(`[TenantService] delete_record_by_id: ${e.message}`, 500);
            next(err);
        }
    }

    async delete_records(request, next) {
        try {
            const { options } = request.body;
            const { seek_conditions } = build_query(options);

            const result = await this.tenant_controller.delete_records({ ...seek_conditions });
            return this.process_delete_result({ ...result });
        } catch (e) {
            const err = this.process_failed_response(`[TenantService] delete_records: ${e.message}`, 500);
            next(err);
        }
    }
}

module.exports = new TenantService(TenantController);