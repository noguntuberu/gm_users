/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const router = require('express').Router();
const {
    handle_404,
    handle_error,
    setup_request,
    process_response,
} = require('../middlewares/http');

/** Route Handlers */
const contact_route_handler = require('./contact');
const guest_route_handler = require('./guest');
const mailing_list_route_handler = require('./mailing-list');
const tenant_route_handler = require('./tenant');

/** Cross Origin Handling */
router.use(setup_request);
router.use('/contacts', contact_route_handler);
router.use('/guests', guest_route_handler);
router.use('/mailing-lists', mailing_list_route_handler);
router.use('/tenants', tenant_route_handler);
router.use(process_response);

/** Static Routes */
router.use('/image/:image_name', (request, response) => {

});

router.use(handle_404);
router.use(handle_error);

module.exports = router;