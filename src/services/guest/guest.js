/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/
//
const _RootService = require('../_root');
const AccountRecoveryController = require('../../controllers/account-recovery');
const OtpController = require('../../controllers/otp');
const TenantController = require('../../controllers/tenant');
const MailingListModel = require('../../models/mailing-list');
const { ListContactSchema } = require('../../schemas/mailing-list');

const { AccountRecoverySchema, LogInSchema, SignUpSchema } = require('../../schemas/guest');
const {
    check_password_match,
    encrypt_password,
    generate_authentication_token,
    validate_password
} = require('./general-helper');

const { create_demo_subscription } = require('../../clients/resource');
const { send_email } = require('../_email');

class GuestService extends _RootService {
    constructor(
        account_recovery_controller,
        otp_controller,
        tenant_controller,
    ) {
        super();

        this.account_recovery_controller = account_recovery_controller;
        this.otp_controller = otp_controller;
        this.tenant_controller = tenant_controller;
    }

    async activate_record(request, next) {
        try {
            const { key } = request.params;
            if (!key) {
                return this.process_failed_response(`Invalid activation key`, 400);
            }

            const user_updation = await this.tenant_controller.update_records({ _id: key }, { is_active: true });
            const { ok, nModified } = user_updation;
            if (user_updation && ok && nModified) {
                this.tenant_controller.read_records({ _id: key }).then( record => {
                    if (!record[0]) return;
                    create_demo_subscription(record[0].id);
                }).catch(f => f);
                return this.process_successful_response(`Account Activation successful.`);
            }

            if (user_updation && ok && !nModified) return this.process_successful_response(`Account is already activated.`, 210);
            return this.process_failed_response(`Update failed`, 500);
        } catch (e) {
            const err = this.process_failed_response(`[GuestService] activate_record: ${e.message}`, 500);
            next(err);
        }
    }

    async create_record(request, next) {
        try {
            const { body } = request;
            const { error } = SignUpSchema.validate(body);
            const { email, firstname, lastname, password } = body;

            if (error) throw new Error(error);

            const email_validation = this.validate_email(email);
            if (!email_validation.is_valid) {
                return this.process_failed_response(email_validation.message, 400);
            }

            const validated_email = email_validation.message;
            const user_record = await this.tenant_controller.read_records({ email });
            if (user_record && user_record.length) {
                return this.process_failed_response(`Email address already in use.`, 400);
            }

            const password_validation = validate_password(password);
            if (!password_validation.is_valid) {
                return this.process_failed_response(password_validation.message, 400);
            }

            const encrypted_password = await encrypt_password(password_validation.message);
            const data_to_create = {
                email: validated_email,
                firstname,
                lastname,
                password: encrypted_password,
            };

            const created_record = await this.tenant_controller.create_record(data_to_create);
            const { _id } = created_record
            if (!created_record || !_id) {
                return this.process_failed_response(`Account creation failed.`);
            }

            await send_email(validated_email, _id, 'activation');
            return this.process_successful_response(`Account created succesfully. Activation link sent to ${validated_email}`);
        } catch (e) {
            const err = this.process_failed_response(`[GuestService] create_record: ${e.message}`, 500);
            next(err);
        }
    }

    async initiate_password_reset(request, next) {
        try {
            const { email } = request.body;

            if (!email) {
                return this.process_failed_response('Email not specified', 400);
            }

            const email_validation = this.validate_email(email);
            if (!email_validation.is_valid) {
                return this.process_failed_response(email_validation.message, 400);
            }
            const validated_email = email_validation.message;

            const user_record = await this.tenant_controller.read_records({ email: validated_email, is_active: true });
            if (!user_record || !user_record.length) {
                return this.process_failed_response(`Account not found.`, 400);
            }

            let expires_at = Date.now() + (600000), recovery_id = '', tenant_id = user_record[0].id;
            let recovery_record = await this.account_recovery_controller.read_records({ tenant_id });
            if (recovery_record && recovery_record.length) { // If user has attempted to recover password previously
                recovery_id = recovery_record[0]._id;
                // update new expiry time
                await this.account_recovery_controller.update_records({ tenant_id }, { expires_at });
            } else { // If this is the user's first recovery attempt
                recovery_record = await this.account_recovery_controller.create_record({
                    tenant_id,
                    expires_at,
                });

                recovery_id = recovery_record._id;
            }

            await send_email(validated_email, recovery_id, 'recovery');
            return this.process_successful_response(`Recovery details sent to ${validated_email}.`);
        } catch (e) {
            const err = this.process_failed_response(`[GuestService] initiate_password_reset: ${e.message}`, 500);
            next(err);
        }
    }

    async login(request, next) {
        try {
            const { error } = LogInSchema.validate(request.body);
            if (error) throw new Error(error);

            const { email, password } = request.body;

            const email_validation = this.validate_email(email);
            if (!email_validation.is_valid) {
                return this.process_failed_response(email_validation.message, 400);
            }

            const password_validation = validate_password(password);
            if (!password_validation.is_valid) {
                return this.process_failed_response(password_validation.message, 400);
            }

            const validated_email = email_validation.message;
            const validated_password = password_validation.message;

            const result = await this.tenant_controller.read_records({ email: validated_email });
            if (result && result.length) {
                const user_record = result[0];
                if (!user_record.is_active) {
                    return this.process_failed_response(`Account is not activated.`);
                }

                const password_is_correct = await check_password_match(validated_password, user_record.password);
                if (password_is_correct) {

                    const authentication_token = await generate_authentication_token(user_record);
                    return this.process_successful_response({
                        ...user_record,
                        token: authentication_token,
                    });
                }
            }

            return this.process_failed_response(`Incorrect email or password.`, 400);
        } catch (e) {
            const err = this.process_failed_response(`[GuestService] login: ${e.message}`, 500);
            next(err);
        }
    }

    async reset_password(request, next) {
        try {
            const { recovery_id, password } = request.body;
            const { error } = AccountRecoverySchema.validate(request.body);
            if (error) throw new Error(error);

            const recovery_record = await this.account_recovery_controller.read_records({
                _id: recovery_id,
                expires_at: { $gte: Date.now() },
            });

            if (!recovery_record || !recovery_record.length) {
                return this.process_failed_response(`Account recovery key is expired.`, 400);
            }

            const id = recovery_record[0].tenant_id;
            const encrypted_password = await encrypt_password(password);
            const user_updation = await this.tenant_controller.update_records({ id }, { password: encrypted_password });
            const { ok, nModified } = user_updation;

            if (user_updation && ok && nModified) {
                this.account_recovery_controller.update_records({ _id: recovery_id }, { expires_at: (Date.now() - 86400000) });
                return this.process_successful_response(`Password reset successfully.`);
            }

            if (user_updation && ok && !nModified) {
                return this.process_successful_response(`Password cannot be the current password.`, 210);
            }

            return this.process_failed_response(`Failed to reset password`, 500);

        } catch (e) {
            const err = this.process_failed_response(`[GuestService] reset password: ${e.message}`, 500);
            next(err);
        }
    }

    async unsubscribe(request, next) {
        try {
            const { body } = request;
            const { error } = ListContactSchema.validate(body);

            if (error) throw new Error(error);

            const { id } = request.params;
            const { contacts, unsubscribed_from } = body;
            const result = await MailingListModel.updateMany({}, {
                $set: {
                    "contacts.$[element].time_removed": new Date(),
                    "contacts.$[element].is_active": false,
                    "contacts.$[element].is_unsubscribed": true,
                    "contacts.$[element].unsubscribed_from": unsubscribed_from,
                },
            }, {
                multi: true,
                arrayFilters: [
                    { "element.id": { $in: [...contacts] } },
                    { id: { $in: [id.split()] } }
                ],
            });
            return this.process_update_result(result);
        } catch (e) {
            const err = this.process_failed_response(`[MailingListService] delete_contacts: ${e.message}`, 500);
            next(err);
        }
    }
}

module.exports = new GuestService(AccountRecoveryController, OtpController, TenantController);