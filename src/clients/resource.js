/** */
require('dotenv').config();
const axios = require('axios').default;
const { GM_SALES_URI, GM_TOKEN } = process.env;
const { client_logger } = require('../utilities/logger');

const process_error = (message, code = 410) => {
    return {
        error: message,
        payload: null,
        status_code: code,
        success: false,
    }
}

const create_demo_subscription = async (tenant_id) => {
    try {
        let data = {
            amount: 9.99,
            expires_on: Date.now() + (86400000 * 30),
            name: "Adventurer",
            resources_allowed: {
                contacts: 1000,
                emails: 10000,
            },
            tenant_id,
        };

        await axios.post(`${GM_SALES_URI}/subscriptions`, data, {
            headers: {
                authorization: `Bearer ${GM_TOKEN}`,
            }
        });
    } catch (e) {
        client_logger.error(`[Resource Client] create_demo_subscription: ${e.message}`);
    }
}

const fetch_subscription_info = async (tenant_id, response) => {
    const resource_response = await axios.get(`${GM_SALES_URI}/subscriptions?tenant_id=${tenant_id}&sort_by=-created_on`, {
        headers: {
            authorization: `Bearer ${GM_TOKEN}`
        }
    });
    const { error, payload } = resource_response.data;
    if (error) {
        client_logger.error(`[Resource Error] fetch_subscription_info: ${error}`);
        throw new Error(error);
    }

    if (!payload.length) {
        client_logger.error(`[Resource Error] fetch_subscription_info: Subscription not found`);
        throw new Error(`Subscription not found`);
    }

    return payload[0];

}

const update_subscription_info = async (subscription_id, data) => {
    const resource_response = await axios.put(`${GM_SALES_URI}/subscriptions/${subscription_id}/resources`, {
        ...data
    }, {
        headers: {
            authorization: `Bearer ${GM_TOKEN}`
        }
    });

    const { error, status_code } = resource_response.data;
    if (error) {
        client_logger.error(`[Resource Error] update_subscription_info: ${error}`);
        throw new Error(error);
    }

    if (status_code != 200) {
        client_logger.error(`[Resource Error] update_subscription_info: Could not update subscription ${subscription_id}: ${JSON.stringify(data)}`);
        throw new Error(`Could not update subscription ${subscription_id}: ${JSON.stringify(data)}`);
    }
}

module.exports = { create_demo_subscription, process_error, fetch_subscription_info, update_subscription_info };