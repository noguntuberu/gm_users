/**
 * User Authentication Middleware
 */
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { logger } = require('../utilities/logger');
const { process_error } = require('../clients/resource');
const { JWT_ISSUER, JWT_SECRET, GM_TOKEN } = process.env;

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

        if (token === GM_TOKEN ) {
            next();
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
        console.log(`[Auth Error] ${e.message}`);
        logger.log(`[Auth Error] ${e.message}`);
    }
}

module.exports = { authenticate_user };