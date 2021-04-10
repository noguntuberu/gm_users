/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/
const ejs = require('ejs');
const router = require('express').Router();
const { resolve } = require('path');
const {
    handle_404,
    handle_error,
    setup_request,
    process_response,
} = require('../middlewares/http');
const { authenticate_user } = require('../middlewares/auth');

/** Route Handlers */
const api_contact_route_handler = require('./api/contact');
const contact_route_handler = require('./contact');
const guest_route_handler = require('./guest');
const mailbox_route_handler = require('./mailbox');
const mailing_list_route_handler = require('./mailing-list');
const tenant_route_handler = require('./tenant');

/** Cross Origin Handling */
router.use(setup_request);
router.use('/api/contacts', api_contact_route_handler);
router.use('/guests', guest_route_handler);
router.use('/contacts', authenticate_user, contact_route_handler);
router.use('/mailboxes', authenticate_user, mailbox_route_handler);
router.use('/mailing-lists', authenticate_user, mailing_list_route_handler);
router.use('/tenants', authenticate_user, tenant_route_handler);

/** */
router.get(`/templates/:type`, async (request, response, next) => {
    const { type } = request.params;
    return response.download(resolve(__dirname, `../../public/samples/${type}.csv`));
});
router.use(process_response);

/** Static Routes */
router.use('/image/:image_name', (request, response) => {

});


router.use(handle_404);
router.use(handle_error);

module.exports = router;