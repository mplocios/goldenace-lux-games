import axios from 'axios';
import { KADAPAY_BASE_URL } from './config';
import { buildGetAuthHeaders } from './sign';

export async function queryPayOrder(txid: string) {
  const params = { txid };
  const headers = buildGetAuthHeaders(params);
  const response = await axios.get(`${KADAPAY_BASE_URL}/api/mcht/payment/retrieve`, {
    headers,
    params,
  });
  return response.data;
}

export async function queryPayoutOrder(txid: string) {
  const params = { txid };
  const headers = buildGetAuthHeaders(params);
  const response = await axios.get(`${KADAPAY_BASE_URL}/api/mcht/disbursement/retrieve`, {
    headers,
    params,
  });
  return response.data;
}

export async function queryWalletBalance(currency: string = 'PHP') {
  const params = { currency };
  const headers = buildGetAuthHeaders(params);
  const response = await axios.get(`${KADAPAY_BASE_URL}/api/mcht/wallet`, {
    headers,
    params,
  });
  return response.data;
}
