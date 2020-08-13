/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const Joi = require('@hapi/joi');

module.exports = Joi.object({
    id: Joi.string().min(1).max(Number.MAX_SAFE_INTEGER),
    address: Joi.object(),
    business_name: Joi.string(),
    date_of_birth: Joi.string(),
    email: Joi.string().required(),
    firstname: Joi.string(),
    gender: Joi.string(),
    lastname: Joi.string(),
    phone_number: Joi.string(),
});