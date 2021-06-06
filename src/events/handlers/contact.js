/** */
require('dotenv').config();
const app_events = require('../_events');
const contact_event = require('../constants/contacts');
const { update_subscription_info } = require('../../clients/resource');

/** res */
app_events.on(contact_event.created, async (payload) => {
    const { subscription_id } = payload;
    const data = {
        contacts: 1
    }
    await update_subscription_info(subscription_id, data);
});

app_events.on(contact_event.batch_created, async (payload) => {
    const { count, subscription_id } = payload;
    const data = {
        contacts: Number(count),
    }
    await update_subscription_info(subscription_id, data);
});