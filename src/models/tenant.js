/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const { model, Schema } = require('mongoose');

const TenantSchema = new Schema({
    id: {
        type: Number,
        required: true,
        default: 0,
        unique: true,
    },
    address: {
        country: String,
        state:  String,
        street: String,
        zip: Number,
    },
    business_name : {
        type: String,
        required: false,
    },
    date_of_birth: {
        type: Date,
        required: false,
    },
    email : {
        type: String,
        required: [true, `Email address cannot be empty`]
    },
    firstname : {
        type: String,
        required: false,
    },
    gender: {
        type: String,
        required: false,
    },
    lastname : {
        type: String,
        required: false,
    },
    phone_number : {
        type: String,
        required: false,
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

const Tenant = module.exports = model('Tenant', TenantSchema);

// /** Create Indexes */
// Tenant.ensureIndexes({ time_stamp: -1 }); // single descending
// Tenant.ensureIndexes({ id: 1 }, { unique: true }); // single unique
// Tenant.ensureIndexes({ compound_index_a: 1, compound_index_b: 1 }, { unique: true }); // compound unique