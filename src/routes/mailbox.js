/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const router = require('express').Router();
const mailbox_service = require('../services/mailbox/mailbox');
const mailbox_verification_service = require('../services/mailbox/verification');

try {
    router
        .post('/', async (request, response, next) => {
            request.payload = await mailbox_verification_service.initiate(request, next);
            next();
        })
        .post('/initialization', async (request, response, next) => {
            request.payload = await mailbox_verification_service.initiate(request, next);
            next();
        })
        .post('/verification/:id', async (request, response, next) => {
            request.payload = await mailbox_verification_service.verify(request, next);
            next();
        })
        .get('/', async (request, response, next) => {
            request.payload = await mailbox_service.read_records_by_filter(request, next);
            next();
        })
        .get('/:id', async (request, response, next) => {
            request.payload = await mailbox_service.read_record_by_id(request, next);
            next();
        })
        .get('/search/:keys/:keyword', async (request, response, next) => {
            request.payload = await mailbox_service.read_records_by_wildcard(request, next);
            next();
        })
        .put('/:id/email', async (request, response, next) => {
            request.payload = await mailbox_service.add_email(request, next);
            next();
        })
        .put('/:id', async (request, response, next) => {
            request.payload = await mailbox_service.update_record_by_id(request, next);
            next();
        })
        .put('/', async (request, response, next) => {
            request.payload = await mailbox_service.update_records(request, next);
            next();
        })
        .delete('/:id/email', async (request, response, next) => {
            request.payload = await mailbox_service.delete_email(request, next);
            next();
        })
        .delete('/:id', async (request, response, next) => {
            request.payload = await mailbox_service.delete_record_by_id(request, next);
            next();
        })
        .delete('/', async (request, response, next) => {
            request.payload = await mailbox_service.delete_records(request, next);
            next();
        })
} catch (e) {
    console.log(`[Route Error] /mailing-lists: ${e.message}`);
} finally {
    module.exports = router;
}