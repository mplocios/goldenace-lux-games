import * as crypto from 'crypto';

// Define the environment variables or constants if not using .env
const merchantKey = process.env.SLOTEGRATOR_MERCHANT_KEY || '';
const merchantId = process.env.SLOTEGRATOR_MERCHANT_ID || '';
const baseUrl = process.env.SLOTEGRATOR_URL || '';
const returnUrl = process.env.SLOTEGRATOR_RETURN_URL ||  "";
const timestamp = Math.floor(Date.now() / 1000); // Get current timestamp (in seconds)
const nonce = crypto.randomUUID(); // Generate a random nonce (using Node.js's randomUUID function)

// Set the request parameters

export default function generateSignature(data : any) {
  
  // Sort parameters by key
  const sortedKeys = Object.keys(data).sort();
  const sortedParams: Record<string, string> = {};
  sortedKeys.forEach(key => {
    sortedParams[key] = data[key];
  });

  const hashString = new URLSearchParams(sortedParams).toString();
  
  // Create the HMAC-SHA1 signature
  const XSign = crypto.createHmac('sha1', merchantKey).update(hashString).digest('hex');
 
return XSign
  
}

