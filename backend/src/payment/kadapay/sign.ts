import * as crypto from 'crypto';
import { KADAPAY_MID, KADAPAY_SECRET_KEY } from './config';

export function buildAuthHeaders(body: object): Record<string, string> {
  const requestTime = String(Date.now());
  const bodyStr = JSON.stringify(body);
  const signatureStr = `${requestTime}.${bodyStr}`;
  const signatureHex = crypto
    .createHmac('sha256', KADAPAY_SECRET_KEY)
    .update(signatureStr)
    .digest('hex');
  const auth = 'Basic ' + Buffer.from(`${KADAPAY_MID}:${signatureHex}`).toString('base64');

  return {
    'Content-Type': 'application/json',
    'Authorization': auth,
    'Request-Time': requestTime,
  };
}

export function buildGetAuthHeaders(params: Record<string, string>): Record<string, string> {
  const requestTime = String(Date.now());
  const queryStr = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  const signatureStr = `${requestTime}.${queryStr}`;
  const signatureHex = crypto
    .createHmac('sha256', KADAPAY_SECRET_KEY)
    .update(signatureStr)
    .digest('hex');
  const auth = 'Basic ' + Buffer.from(`${KADAPAY_MID}:${signatureHex}`).toString('base64');

  return {
    'Authorization': auth,
    'Request-Time': requestTime,
  };
}

export function verifyCallbackSignature(body: any, signature: string, requestTime: string): boolean {
  if (!signature || !requestTime) return false;
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
  const signatureStr = `${requestTime}.${bodyStr}`;
  const expected = crypto
    .createHmac('sha256', KADAPAY_SECRET_KEY)
    .update(signatureStr)
    .digest('hex');
  return expected === signature;
}
