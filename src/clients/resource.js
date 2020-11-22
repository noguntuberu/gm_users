/** */
require('dotenv').config();
const axios = require('axios').default;
const { SALES_URI } = process.env;
const { client_logger } = require('../utilities/logger');

const process_error = (message, code = 410) => {
    return {
        error: message,
        payload: null,
        status_code: code,
        success: false,
    }
}

const fetch_subscription_info = async (tenant_id, response) => {
    try {
        const resource_response = await axios.get(`${SALES_URI}/subscriptions?tenant_id=${tenant_id}&sort_by=-created_on`);
        const { error, payload, success } = resource_response.data;
        if (!success || error) {
            throw new Error(error);
        }

        if (!payload.length) {
            return response.status(410).send(process_error(`Subscription not found`, 410));
        }

        return payload[0];
    } catch (e) {
        client_logger.error(`[Resource Error] fetch_subscription_info: ${e.message}`);
        next(e);
    }
}

const update_subscription_info = async (subscription_id, data) => {
    try {
        const resource_response = await axios.put(`${SALES_URI}/subscriptions/${subscription_id}/resources`, {
            ...data
        });
        const { error, status_code, success } = resource_response.data;
        if (!success || error) {
            throw new Error(error);
        }

        if (success && status_code != 200) {
            throw new Error(`
                Could not update subscription ${subscription_id}: ${JSON.stringify(data)}
            `);
        }
    } catch (e) {
        client_logger.error(`[Resource Error] update_subscription_info: ${e.message}`);
    }
}

module.exports = { process_error, fetch_subscription_info, update_subscription_info };