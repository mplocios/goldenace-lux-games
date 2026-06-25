import crypto from 'crypto';

/**
 * Generates HMAC-SHA256 signature for SigePay payment request.
 * @param payload The request payload as a record of key-value pairs.
 * @param secretKey The secret key for HMAC-SHA256 signing.
 * @returns The generated signature.
 */
export async function generateSignature(params: Record<string, any>, secretKey: string): Promise<string> {
    
    const keys = [];
    for (const [key, _] of Object.entries(params)) {
        // Extract the keys that start with x_
        if (key.startsWith("m_")) {
            keys.push(key);
        }
    }

    // Sort
    keys.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });

    // Build the payload string
    let payload = "";
    for (const key of keys) {
        const value = params[key];
        payload += `${key}=${value}`;
    }

    // Create the encoder
    const enc = new TextEncoder();

    const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secretKey),
        {
            name: "HMAC",
            hash: { name: "SHA-256" }
        },
        false,
        ["sign"]
    );

    const signatureBytes = await crypto.subtle.sign(
        "HMAC",
        key,
        enc.encode(payload)
    );

    // Convert to hex
    const bytes = new Uint8Array(signatureBytes);
    const signature = Array.prototype.map.call(bytes, x => x.toString(16).padStart(2, '0'));

    return signature.join("");
}

