/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/
//
const RootService = require('../_root');
const ContactController = require('../../controllers/contact');
const MailingListController = require('../../controllers/mailing-list');
const { SingleContactSchema } = require('../../schemas/contact');
const contact_events = require('../../events/constants/contacts');

class ContactService extends RootService {
    constructor(
        contact_controller,
        mailing_list_controller,
    ) {
        /** */
        super();

        /** */
        this.contact_controller = contact_controller;
        this.mailing_list_controller = mailing_list_controller;
    }

    async add_contact_to_lists(tenant_id, contact_id, list_ids = []) {
        await new Promise((resolve, reject) => {
            list_ids.forEach(list_id => this.add_to_list(tenant_id, contact_id, list_id));
            resolve();
        });
    }

    async add_to_list(tenant_id, contact_id, list_id) {
        const formatted_contacts_for_db = [{
            id: contact_id,
        }];

        await this.mailing_list_controller.update_records({ id: list_id, tenant_id }, {
            $addToSet: { contacts: { $each: [...formatted_contacts_for_db] } },
        });
    }


    async create_record(request, next) {
        try {
            const { body, subscription_id, tenant_id } = request;
            const { error } = SingleContactSchema.validate(body);

            if (error) throw new Error(error);

            delete body.id;
            const result = await this.contact_controller.create_record({ ...body, tenant_id });

            if (result && result.id && body.lists) {
                this.add_contact_to_lists(tenant_id, result.id, body.lists);
            }

            return this.process_single_read(result, {
                event_name: contact_events.created,
                payload: { ...result, subscription_id },
            });
        } catch (e) {
            const err = this.process_failed_response(`[ContactService] created_record: ${e.message}`, 500);
            next(err);
        }
    }
}

module.exports = new ContactService(ContactController, MailingListController);