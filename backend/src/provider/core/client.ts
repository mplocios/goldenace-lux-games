import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as crypto from 'crypto';
import * as qs from 'querystring';
import {
  COREBRIDGE_BASE_URL,
  COREBRIDGE_API_PREFIX,
  COREBRIDGE_OPERATOR_ID,
  COREBRIDGE_API_KEY,
  COREBRIDGE_API_SECRET,
} from './config';

function signRequest(bodyParams: Record<string, any>): Record<string, string> {
  const ts = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');

  const authHeaders: Record<string, string> = {
    'X-Merchant-Id': COREBRIDGE_OPERATOR_ID,
    'X-Timestamp': ts,
    'X-Nonce': nonce,
  };

  const all: Record<string, any> = { ...bodyParams, ...authHeaders };
  const sorted = Object.keys(all).sort()
    .reduce((o, k) => ({ ...o, [k]: all[k] }), {} as Record<string, any>);

  const sign = crypto
    .createHmac('sha1', COREBRIDGE_API_SECRET)
    .update(qs.stringify(sorted))
    .digest('hex');

  return { ...authHeaders, 'X-Sign': sign };
}

class CoreBridgeClient {
  private http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: `${COREBRIDGE_BASE_URL}${COREBRIDGE_API_PREFIX}`,
      timeout: 15000,
    });
  }

  async post(path: string, body: Record<string, any> = {}): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {
        'X-API-Key': COREBRIDGE_API_KEY,
        'Content-Type': 'application/json',
      },
    };
    const response = await this.http.post(path, body, config);
    return response.data;
  }

  async get(path: string, params: Record<string, any> = {}): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {
        'X-API-Key': COREBRIDGE_API_KEY,
      },
      params,
    };
    const response = await this.http.get(path, config);
    return response.data;
  }

  async postSigned(path: string, body: Record<string, any> = {}): Promise<any> {
    const authHeaders = signRequest(body);
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    };
    const response = await this.http.post(path, body, config);
    return response.data;
  }

  async getSigned(path: string, params: Record<string, any> = {}): Promise<any> {
    const authHeaders = signRequest(params);
    const config: AxiosRequestConfig = {
      headers: authHeaders,
      params,
    };
    const response = await this.http.get(path, config);
    return response.data;
  }
}

export const coreBridgeClient = new CoreBridgeClient();
export { signRequest };
