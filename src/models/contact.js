/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const { model, Schema } = require('mongoose');

const ContactSchema = new Schema({
    id: {
        type: Number,
        required: true,
        default: 0,
        unique: true,
    },
    address: {
        city: String,
        country: String,
        state:  String,
        street: String,
        zip: Number,
    },
    date_of_birth: {
        type: Date,
        required: false,
    },
    email: {
        type: String,
        required: true,
    },
    firstname: {
        type: String,
        required: false,
    },
    lastname: {
        type: String,
        required: false,
    },
    tenant_id: {
        type: Number,
        required: true,
    },
    //
    is_active: {
        type: Boolean,
        required: true,
        default: true,
    },
    is_deleted: {
        type: Boolean,
        required: true,
        default: false,
    },
    time_stamp: {
        type: Number,
        required: true,
        default: () => Date.now(),
    },
    created_on: {
        type: Date,
        required: true,
        default: () => new Date(),
    },
    updated_on: {
        type: Date,
        required: true,
        default: () => new Date(),
    },
});

const Contact = module.exports = model('Contact', ContactSchema);

// /** Create Indexes */
// Contact.ensureIndexes({ time_stamp: -1 }); // single descending
// Contact.ensureIndexes({ id: 1 }, { unique: true }); // single unique
// Contact.ensureIndexes({ compound_index_a: 1, compound_index_b: 1 }, { unique: true }); // compound unique