/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const { sign } = require('jsonwebtoken');
const { promisify } = require('util');
const jwt_sign = promisify(sign);

const {
    JWT_SECRET,
} = process.env;

module.exports = {
    check_password_match: async (plain_password, encrypted_password) => {
        return await bcrypt.compare(plain_password, encrypted_password);
    },

    encrypt_password: async (raw_password) => {
        const rounds = 10;
        const salt = await bcrypt.genSalt(rounds);
        const encrypted_password = await bcrypt.hash(raw_password, salt);
        return encrypted_password;
    },

    generate_authentication_token: async (data) => {
        const expiresIn = 21600000;
        const token = await jwt_sign({ ...data }, JWT_SECRET, { expiresIn });
        return token;
    },

    validate_password: (raw_password) => {
        const password = raw_password.trim();

        if (password.length < 8) {
            return {
                is_valid: false,
                message: `Password too short`,
            }
        }
        
        return {
            is_valid: true,
            message: password,
        }
    },
}