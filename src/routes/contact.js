/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const router = require('express').Router();
const contact_service = require('../services/contact/contact');
const { check_batch_contact_limit, check_contact_limit } = require('../middlewares/resource');

try {
    router
    .post('/batch', check_batch_contact_limit, async (request, response, next) => {
        await contact_service.create_records_from_file(request, response, next);
    })
    .post('/', check_contact_limit, async (request, response, next) => {
        request.payload = await contact_service.create_record(request, next);
        next();
    })
    .get('/', async (request, response, next) => {
        request.payload = await contact_service.read_records_by_filter(request, next);
        next();
    })
    .get('/:id', async (request, response, next) => {
        request.payload = await contact_service.read_record_by_id(request, next);
        next();
    })
    .get('/search/:keys/:keyword', async (request, response, next) => {
        request.payload = await contact_service.read_records_by_wildcard(request, next);
        next();
    })
    .put('/:id', async (request, response, next) => {
        request.payload = await contact_service.update_record_by_id(request, next);
        next();
    })
    .put('/', async (request, response, next) => {
        request.payload = await contact_service.update_records(request, next);
        next();
    })
    .delete('/:id', async (request, response, next) => {
        request.payload = await contact_service.delete_record_by_id(request, next);
        next();
    })
    .delete('/', async (request, response, next) => {
        request.payload = await contact_service.delete_records(request, next);
        next();
    })
    
} catch (e) {
    console.log(`[Route Error] /contacts: ${e.message}`);
} finally {
    module.exports = router;
}