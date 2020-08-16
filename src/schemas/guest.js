/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const Joi = require('@hapi/joi');

module.exports.LogInSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

module.exports.AccountRecoverySchema = Joi.object({
    recovery_id: Joi.string().required(),
    password: Joi.string().min(8).required(),
});

module.exports.SignUpSchema = Joi.object({
    email: Joi.string().email().required(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    password: Joi.string().min(8).required(),
});