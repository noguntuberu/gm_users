/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/
//
const RootService = require('../_root');
const MailboxController = require('../../controllers/mailbox');
const { send_email } = require('../_email');

class MailboxVerificationService extends RootService {
    constructor(
        mailbox_controller
    ) {
        super();
        this.mailbox_controller = mailbox_controller;
    }

    async initiate(request, next) {
        try {
            const { body, tenant_id } = request;
            const { email } = body;

            const code = Math.ceil(Math.random() * 100000);
            const read_response = await this.mailbox_controller.read_records({ tenant_id });

            let response;
            if (read_response.id) {
                response = await this.mailbox_controller.update_records({ id, tenant_id }, { ...read_response, code });
                await send_email(email, code, 'mailbox');
                return this.process_successful_response({ ...read_response, ...response });
            }

            response = await this.mailbox_controller.create_record({ code, tenant_id });
            await send_email(email, code, 'mailbox');
            return this.process_successful_response({ ...read_response, ...response });
        } catch (e) {
            const err = this.process_failed_response(`[MailboxVerificationService] initiate: ${e.message}`, 500);
            next(err);
        }
    }

    async verify(request, next) {
        try {
            const { body, params, tenant_id } = request;
            const { email, code, } = body;
            const { id } = params;

            const read_response = await this.mailbox_controller.read_records({ tenant_id });
            const { code: retreived_code } = read_response[0];

            if (!retreived_code || code !== retreived_code) return this.process_failed_response('Invalid code', 400);

            await this.mailbox_controller.update_records({ id, tenant_id }, {
                $addToSet: { emails: { $each: [email] } },
            });
            return this.process_successful_response({});
        } catch (e) {
            const err = this.process_failed_response(`[MailboxVerificationService] verify: ${e.message}`, 500);
            next(err);
        }
    }
}

module.exports = new MailboxVerificationService(MailboxController);