/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const router = require('express').Router();
const mailing_list_service = require('../services/mailing-list/mailing-list');

try {
    router
        .post('/', async (request, response, next) => {
            request.payload = await mailing_list_service.create_record(request, next);
            next();
        })
        .get('/', async (request, response, next) => {
            request.payload = await mailing_list_service.read_records_by_filter(request, next);
            next();
        })
        .get('/:id', async (request, response, next) => {
            request.payload = await mailing_list_service.read_record_by_id(request, next);
            next();
        })
        .get('/search/:keys/:keyword', async (request, response, next) => {
            request.payload = await mailing_list_service.read_records_by_wildcard(request, next);
            next();
        })
        .put('/:id/contacts', async (request, response, next) => {
            request.payload = await mailing_list_service.add_contacts(request, next);
            next();
        })
        .put('/:id', async (request, response, next) => {
            request.payload = await mailing_list_service.update_record_by_id(request, next);
            next();
        })
        .put('/', async (request, response, next) => {
            request.payload = await mailing_list_service.update_records(request, next);
            next();
        })
        .delete('/:id/contacts', async (request, response, next) => {
            request.payload = await mailing_list_service.delete_contacts(request, next);
            next();
        })
        .delete('/:id', async (request, response, next) => {
            request.payload = await mailing_list_service.delete_record_by_id(request, next);
            next();
        })
        .delete('/', async (request, response, next) => {
            request.payload = await mailing_list_service.delete_records(request, next);
            next();
        })
} catch (e) {
    console.log(`[Route Error] /mailing-lists: ${e.message}`);
} finally {
    module.exports = router;
}