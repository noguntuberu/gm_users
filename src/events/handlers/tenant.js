/** */
require('dotenv').config();
const app_events = require('../_events');
const { CREATED } = require('../constants/tenant');
const { create_wallet } = require('../../clients/resource');

app_events.on(CREATED, async (data) => {
    create_wallet(data.id);
});