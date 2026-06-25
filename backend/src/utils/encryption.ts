import { ALPHANUMERIC_SET,ENCRYPT_SECRET_KEY } from "../constant";
 

export async function encrypt(text) {
    let encrypted = '';
    // Make sure the input text is at least 32 characters long (pad or truncate)
    let paddedText = text.padEnd(32, '\0').substring(0, 32);

    for (let i = 0; i < paddedText.length; i++) {
        // XOR the text character with the key character
        const xorResult = paddedText.charCodeAt(i) ^ ENCRYPT_SECRET_KEY.charCodeAt(i % ENCRYPT_SECRET_KEY.length);
        
        // Map XOR result to an index in the alphanumeric set (modulo 62)
        encrypted += ALPHANUMERIC_SET[(xorResult + 62) % ALPHANUMERIC_SET.length]; // Ensure positive values
    }

    return encrypted;
}

// Decrypt function (always outputs the original text, removes padding)
export async function decrypt(encryptedText, key) {
    // Verify the encrypted text is exactly 32 characters long
    if (encryptedText.length !== 32) {
        throw new Error('Encrypted text must be exactly 32 characters long');
    }

    let decrypted = '';

    for (let i = 0; i < encryptedText.length; i++) {
        // Find the index of the current encrypted character in the ALPHANUMERIC_SET
        const charIndex = ALPHANUMERIC_SET.indexOf(encryptedText[i]);
        if (charIndex === -1) {
            throw new Error('Invalid character in encrypted text');
        }

        // XOR the character back to the original
        const xorResult = (charIndex - 62) ^ key.charCodeAt(i % key.length); // Ensure positive XOR results
        decrypted += String.fromCharCode(xorResult);
    }

    // Trim padding characters (null characters used for padding)
    return decrypted.replace(/\0/g, '');
}
