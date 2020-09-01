/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const Joi = require('@hapi/joi');

module.exports.MailingListSchema = Joi.object({
    id: Joi.string().min(1).max(Number.MAX_SAFE_INTEGER),
    contacts: Joi.array(),
    description: Joi.string(),
    name: Joi.string().required(),
    tenant_id: Joi.number().required(),
});

module.exports.ListContactSchema = Joi.object({
    contacts: Joi.array().items(Joi.number().required()).required()
});