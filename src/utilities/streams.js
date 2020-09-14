/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 */

const { Transform, Readable, } = require('stream');
const contact_event = require('../events/constants/contacts');
const app_events = require('../events/_events');

class FileReader extends Readable {
    constructor(source, options = {}) {
        super(options);
        this._source = [];
        this._source_keys = [];
        this._format_source(source);
    }

    _format_source(source) {
        const as_string = Buffer.from(source).toString().trim();
        const as_array = as_string.split('\n');
        this._source_keys = as_array[0].split(',');
        this._source = as_array.slice(1);
    }

    _read() {
        for (let line in this._source) {
            const as_array = this._source[line].split(',');
            const chunk = JSON.stringify({
                [this._source_keys[0]]: as_array[0],
                [this._source_keys[1]]: as_array[1],
            });
            this.push(chunk);
        }
        this.push(null);
    }
}

class ContactCreator extends Transform {
    constructor(ContactController, subscription_id, tenant_id, options = {}) {
        super(options);
        this._contact_controller = ContactController;
        this._count = 0;
        this._subscription_id = subscription_id;
        this.tenant_id = tenant_id;
    }

    async _transform(chunk, encoding, callback) {
        try {
            const as_string = Buffer.from(chunk).toString();
            const as_object = JSON.parse(as_string);
            const record = await this._contact_controller.create_record({
                ...as_object,
                tenant_id: this.tenant_id,
            });

            if (record && record.id) {
                this._count += 1;
            }

            this.push(JSON.stringify({ raw: as_object, record }));
            callback();
        } catch (e) {
            console.log(`[ContcatCreator Stream _transform Error] ${e.message}`);
            this.push(chunk);
        }
    }

    _flush(callback) {
        try {
            app_events.emit(contact_event.batch_created, {
                subscription_id: this._subscription_id,
                count: this._count
            });
            callback();
        } catch (e) {
            console.log(`[ContcatCreator Stream _flush Error] ${e.message}`);
        }
    }
}

class MailingListStream extends Transform {
    constructor(MailingListController, list_id, options = {}) {
        super(options);
        this._listController = MailingListController;
        this._list_id = list_id;
    }

    async _transform(chunk, encoding, callback) {
        try {
            const as_string = Buffer.from(chunk).toString();
            const as_object = JSON.parse(as_string);
            let transformed_chunk = as_object;
            if (!as_object.record || !as_object.record.id) {
                transformed_chunk = { data: as_object.raw, success: false }
            } else {
                await this._listController.update_records({ id: this._list_id }, {
                    $addToSet: { contacts: as_object.record.id },
                });
                transformed_chunk = { data: as_object.record, success: true };
            }

            this.push(JSON.stringify(transformed_chunk));
            callback();
        } catch (e) {
            console.log(`[MailingListStream Error] ${e.message}`);
            this.push(chunk);
        }
    }
}

module.exports = { ContactCreator, FileReader, MailingListStream };