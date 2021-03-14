/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const Joi = require('@hapi/joi');

module.exports.SingleContactSchema = Joi.object({
    address: Joi.object({
        city: Joi.string(),
        country: Joi.string(),
        state: Joi.string(),
        street: Joi.string(),
        zip: Joi.string(),
    }),
    date_of_birth: Joi.string(),
    email: Joi.string().email().required(),
    firstname: Joi.string(),
    id: Joi.string().min(1).max(Number.MAX_SAFE_INTEGER),
    lastname: Joi.string(),
    lists: Joi.array(),
    tenant_id: Joi.number().required(),
});