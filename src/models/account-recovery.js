/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const { model, Schema } = require('mongoose');

const AccountRecoverySchema = new Schema({
    id: {
        type: Number,
        required: true,
        default: 0,
        unique: true,
    },
    tenant_id: {
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

const AccountRecovery = module.exports = model('AccountRecovery', AccountRecoverySchema);

// /** Create Indexes */
// AccountRecovery.ensureIndexes({ time_stamp: -1 }); // single descending
// AccountRecovery.ensureIndexes({ id: 1 }, { unique: true }); // single unique
// AccountRecovery.ensureIndexes({ compound_index_a: 1, compound_index_b: 1 }, { unique: true }); // compound unique