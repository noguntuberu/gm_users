/** */
require('dotenv').config();
const { client_logger } = require('../../utilities/logger');
const app_events = require('../_events');
const contact_event = require('../constants/contacts');
const { update_subscription_info } = require('../../clients/resource');

/** res */
app_events.on(contact_event.created, async (payload) => {
    try {
        const { subscription_id } = payload;
        const data = {
            contacts: 1
        }
        await update_subscription_info(subscription_id, data);
    } catch (e) {
        console.log(`[Resource Error] contact_created event: ${e.message}`);
        client_logger.error(`[Resource Error] could not update contact for subscription ${payload.subscription_id}: ${e.message}`)
    }
});

app_events.on(contact_event.batch_created, async (payload) => {
    try {
        const { count, subscription_id } = payload;
        const data = {
            contacts: Number(count),
        }
        await update_subscription_info(subscription_id, data);
    } catch (e) {
        console.log(`[Resource Error] contact_created event: ${e.message}`);
        client_logger.error(`[Resource Error] could not update contact for subscription ${payload.subscription_id}: ${e.message}`)
    }
});