/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const { model, Schema } = require('mongoose');

const OtpSchema = new Schema({
    id: {
        type: Number,
        required: true,
        default: 0,
        unique: true,
    },
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expires_at: {
        type: String,
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

const Otp = module.exports = model('Otp', OtpSchema);

// /** Create Indexes */
// Otp.ensureIndexes({ time_stamp: -1 }); // single descending
// Otp.ensureIndexes({ id: 1 }, { unique: true }); // single unique
// Otp.ensureIndexes({ compound_index_a: 1, compound_index_b: 1 }, { unique: true }); // compound unique