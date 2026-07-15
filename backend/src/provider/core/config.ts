require('dotenv').config();

export const COREBRIDGE_BASE_URL = process.env.COREBRIDGE_BASE_URL || 'https://corebridgetechnologies.net';
export const COREBRIDGE_API_PREFIX = '/api/v1/operator';
export const COREBRIDGE_OPERATOR_ID = process.env.COREBRIDGE_OPERATOR_ID || 'op_goldenace';
export const COREBRIDGE_API_KEY = process.env.COREBRIDGE_API_KEY || '';
export const COREBRIDGE_API_SECRET = process.env.COREBRIDGE_API_SECRET || '';
export const COREBRIDGE_CURRENCY = process.env.COREBRIDGE_CURRENCY || 'PHP';
export const COREBRIDGE_JURISDICTION = process.env.COREBRIDGE_JURISDICTION || 'PH';
