/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const router = require('express').Router();
const guest_service = require('../services/guest/guest');

try {

    router
    .post('/register', async (request, response, next) => {
        request.payload = await guest_service.create_record(request, next);
        next();
    })
    .post('/login', async (request, response, next) => {
        request.payload = await guest_service.login(request, next);
        next();
    })
    .post('/password/recover', async (request, response, next) => {
        request.payload = await guest_service.initiate_password_reset(request, next);
        next();
    })
    .post('/password/reset', async (request, response, next) => {
        request.payload = await guest_service.reset_password(request, next);
        next();
    })
    .get('/activation/:key', async (request, response, next) => {
        request.payload = await guest_service.activate_record(request, next);
        next();
    })
    
} catch (e) {
    console.log(`[Route Error] /guests: ${e.message}`);
} finally {
    module.exports = router;
}