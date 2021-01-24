/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/
const { logger } = require('../utilities/logger');

module.exports = {
    handle_404(request, response, next) {
        const return_data = {
            error: `Resource not found`,
            payload: null,
            status_code: 404,
        };

        next(return_data);
    },

    handle_error(error, request, response, next) {

        // Log errors
        logger.error(error.error);
        console.log(error);
        // return error
        return response.status(error.status_code || 500).json({
            status_code: error.status_code,
            error: error.error || `Internal Server Error`,
            payload: null
        });
    },


    process_response(request, response, next) {
        if (!request.payload) return next();

        const { status_code } = request.payload;
        return response.status(status_code).json(request.payload)
    },

    setup_request(request, response, next) {
        request.headers['access-control-allow-origin'] = '*';
        request.headers['access-control-allow-headers'] = '*';

        if (request.method === 'OPTIONS') {
            request.headers['access-control-allow-methods'] = 'GET, POST, PUT, PATCH, DELETE';
            response.status(200).json();
        }

        next();
    },
}