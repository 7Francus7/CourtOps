import crypto from 'crypto';

// Use a fallback for development ONLY. In production, this env var is mandatory.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-key-must-be-32-bytes-length!!';
const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string): string {
       if (!text) return text;

       // Ensure the key is 32 bytes (256 bits)
       // If the provided key is shorter/longer, we should ideally hash it or pad it. 
       // For simplicity/safety, we assume the user provides a correct key or we derive one.
       const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substring(0, 32);

       const iv = crypto.randomBytes(IV_LENGTH);
       const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
       let encrypted = cipher.update(text);
       encrypted = Buffer.concat([encrypted, cipher.final()]);

       return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
       if (!text) return text;

       try {
              const textParts = text.split(':');
              if (textParts.length < 2) return text; // Not encrypted or invalid format

              const iv = Buffer.from(textParts.shift()!, 'hex');
              const encryptedText = Buffer.from(textParts.join(':'), 'hex');

              const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substring(0, 32);

              const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
              let decrypted = decipher.update(encryptedText);
              decrypted = Buffer.concat([decrypted, decipher.final()]);

              return decrypted.toString();
       } catch (error) {
              console.error("Decryption failed:", error);
              return text; // Fallback to returning original (might be unencrypted legacy data)
       }
}
