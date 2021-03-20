/**
 * User Authentication Middleware
 */
require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios').default;
const { logger } = require('../utilities/logger');
const { process_error } = require('../clients/resource');
const { JWT_ISSUER, JWT_SECRET, GM_ACCESS, GM_TOKEN } = process.env;

const authenticate_api_key = async (request, response, next) => {
    try {
        const { authorization } = request.headers;
        if (!authorization) {
            return next(process_error(`Unauthorized`, 403));
        }

        const [, api_key] = authorization.split(' ');
        if (!api_key) {
            return next(process_error(`Unauthorized`, 403));
        }

        const { error, payload } = (await axios.get(`${GM_ACCESS}/verify/${api_key}`)).data;
        if (error) {
            return next(process_error(`Unauthorized`, 403));
        }

        request.tenant_id = payload.org_id;
        next()
    } catch (e) {
        logger.error(`[Auth Error] ${e.message}`);
        next(process_error('Unauthorized', 403));
    }
}

const authenticate_param_api_key = async (request, response, next) => {
    try {
        const { api_key } = request.params;
        if (!api_key) {
            return next(process_error(`Unauthorized`, 403));
        }

        const { error, payload } = (await axios.get(`${GM_ACCESS}/verify/${api_key}`)).data;
        if (error) {
            return next(process_error(`Unauthorized`, 403));
        }

        request.tenant_id = payload.org_id;
        next()
    } catch (e) {
        logger.error(`[Auth Error] ${e.message}`);
        next(process_error('Unauthorized', 403));
    }
}

const authenticate_user = async (request, response, next) => {
    try {
        const { authorization } = request.headers;
        if (!authorization) {
            return next(process_error(`Unauthorized`, 403));
        }

        const auth_parts = authorization.split(' ');
        const token = auth_parts[1];
        if (!token) {
            return next(process_error(`Unauthorized`, 403));
        }

        if (token === GM_TOKEN) {
            request.tenant_id = { $exists: true }
            return next();
        }

        const verified_data = await jwt.verify(token, JWT_SECRET, {
            issuer: JWT_ISSUER
        });

        const { tenant_id } = verified_data;
        if (!tenant_id || isNaN(tenant_id)) {
            return next(process_error(`Unauthorized`, 403));
        }

        request.tenant_id = tenant_id;
        next();
    } catch (e) {
        logger.error(`[Auth Error] ${e.message}`);
    }
}

module.exports = { authenticate_api_key, authenticate_param_api_key, authenticate_user };