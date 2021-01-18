/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

/** environment config */
require('dotenv').config();
const {
    APP_PORT
} = process.env;

/** Database Conneciton Setup */
const database = require('./src/models/_config');
database.connect();

/** Load Event Handlers Events */
require('./src/events/_config');

/** Routes Configuration */
const route_handler = require('./src/routes/_config');

/** 3rd Party Middlewares */
const body_parser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const file_upload = require('express-fileupload');
const helmet = require('helmet');
const { morgan } = require('./src/utilities/logger');


/** App Initialisation */
const app = express();

/** Middleware Applications */
app.use(cors());
app.use(compression());
app.use(helmet());
app.use(body_parser.json({ limit: '10mb' }));
app.use(body_parser.urlencoded({ limit: '10mb', extended: true }));
app.use(file_upload());
app.use(morgan);

/** Route Middleware */
app.use('/users', route_handler);

/** */
app.listen(APP_PORT, () => {
    console.log(`Server started on port ${APP_PORT}`);
});