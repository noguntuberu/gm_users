/** */
const { process_error, fetch_subscription_info } = require('../clients/resource');

module.exports.check_batch_contact_limit = async (request, response, next) => {
    try {
        const limits = {
            size: 5 * 1024 * 1024,
            type: ['text/csv'],
        };
        const { tenant_id, } = request.body;
        if (!request.files) {
            return response.status(400).json(process_error(`No file attached`, 400));
        }

        const { contacts } = request.files;
        if (!contacts || !tenant_id) {
            return response.status(400).json(process_error(`Invalid data`, 400));
        }

        const { data, mimetype, size } = contacts;
        if (size > limits.size) {
            return response.status(400).json(process_error(`File to large`, 400));
        }

        if (!limits.type.includes(mimetype)) {
            return response.status(400).json(process_error(`Invalid file type`, 400));
        }

        const data_as_string = Buffer.from(data).toString();
        const data_as_array = data_as_string.split('\n');
        if (data_as_array.length < 2) {
            return response.status(400).json(process_error(`Invalid data`, 400));
        }

        const payload = await fetch_subscription_info(tenant_id, response);
        const contacts_allowed = payload.resources_allowed.contacts;
        const contacts_used = payload.resources_used.contacts;
        const contacts_available = Number(contacts_allowed - contacts_used);

        if (Date.now() > payload.expires_on) { // if expired
            return response.status(415).json(process_error(`No active subscriptions`, 412));
        }

        if (contacts_available < (data_as_array.length - 1)) {
            // -1 because first row contains field names
            return response.status(415).json(process_error(`Insufficient resources`, 415));
        }

        request.subscription_id = payload.id;
        next();
    } catch (e) {
        console.log(`[Resource Error] check_batch_contact_limit: ${e.message}`);
        next(e);
    }
}

module.exports.check_contact_limit = async (request, response, next) => {
    try {
        const { tenant_id } = request.body;
        if (!tenant_id) {
            return next()
        }

        const payload = await fetch_subscription_info(tenant_id, response);
        const contacts_allowed = payload.resources_allowed.contacts;
        const contacts_used = payload.resources_used.contacts;
        const contacts_available = Number(contacts_allowed - contacts_used);

        if (Date.now() > payload.expires_on) { // if expired
            return response.status(415).json(process_error(`No active subscriptions`, 412));
        }

        if (!contacts_available) {
            return response.status(415).json(process_error(`Insufficient resources`, 415));
        }

        request.subscription_id = payload.id;
        next();
    } catch (e) {
        console.log(`[Resource Error] check_contact_limit: ${e.message}`);
        next(e);
    }
}