/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 */

const { Transform, Readable, } = require('stream');

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
    constructor(ContactController, tenant_id, options = {}) {
        super(options);
        this._contact_controller = ContactController;
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
            this.push(JSON.stringify({ raw: as_object, record }));
            callback();
        } catch (e) {
            console.log(`[ContcatCreator Stream Error] ${e.message}` );
            this.push(chunk);
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
                transformed_chunk = { data: as_object.record, success: true};
            }
    
            this.push(JSON.stringify(transformed_chunk));
            callback();
        } catch (e) {
            console.log(`[MailingListStream Error] ${e.message}` );
            this.push(chunk);
        }
    }
}

module.exports = { ContactCreator, FileReader, MailingListStream };