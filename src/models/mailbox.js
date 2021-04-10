/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const { model, Schema } = require('mongoose');

const MailboxSchema = new Schema({
    id: {
        type: Number,
        required: true,
        default: 0,
    },
    code: {
        type: Number,
        required: false,
    },
    emails: [{
        type: String,
    }],
    tenant_id : {
        type: Number,
        required: true,
    },

    // metadata
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

const Mailbox = module.exports = model('Mailbox', MailboxSchema);

// /** Create Indexes */
// Mailbox.ensureIndexes({ time_stamp: -1 }); // single descending
// Mailbox.ensureIndexes({ id: 1 }, { unique: true }); // single unique
// Mailbox.ensureIndexes({ compound_index_a: 1, compound_index_b: 1 }, { unique: true }); // compound unique