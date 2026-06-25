
require('dotenv').config();

export const API_PREFIX = process.env.API_PREFIX
export const JWT_SECRET = process.env.JWT_SECRET_KEY || 'ToTheMoon@69_420';
export const PORT = process.env.PORT || 8000;
export const OTP_EXPIRATION = process.env.OTP_EXPIRATION || '200'
export const ENCRYPT_SECRET_KEY =  'f47ac10b58cc4372a5670e02b2c3d477';
export const ALPHANUMERIC_SET = 'abcdefghijklmnopqrstuvwxyz0123456789';
