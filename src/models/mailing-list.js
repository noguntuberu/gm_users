/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const { model, Schema } = require('mongoose');

const MailingListSchema = new Schema({
    id: {
        type: Number,
        required: true,
        default: 0,
    },
    contacts: [
        {
            id: {
                type: Number,
                required: true,
            },
            unsubscribed_from: {
                type: Number,
                required: false,
            },
            time_added: {
                type: Date,
                required: true,
                default: () => new Date(),
            },
            time_removed: {
                type: Date,
                required: true,
                default: () => new Date(),
            },
            is_active: {
                type: Boolean,
                required: true,
                default: true,
            },
            is_unsubscribed: {
                type: Boolean,
                required: true,
                default: false,
            },
        }
    ],
    description : {
        type: String,
        required: false,
    },
    name : {
        type: String,
        required: true,
    },
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

const MailingList = module.exports = model('MailingList', MailingListSchema);

// /** Create Indexes */
// MailingList.ensureIndexes({ time_stamp: -1 }); // single descending
// MailingList.ensureIndexes({ id: 1 }, { unique: true }); // single unique
// MailingList.ensureIndexes({ compound_index_a: 1, compound_index_b: 1 }, { unique: true }); // compound unique