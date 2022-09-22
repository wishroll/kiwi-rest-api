import crypto from 'crypto';
const algorithm = 'aes-256-cbc';
const secret = process.env.CIPHER_SECRET || '';
const iv = secret.slice(0, 16);

export const encrypt = (text: string) => {
  const aes = crypto.createCipheriv(algorithm, secret, iv);
  return aes.update(text, 'utf8', 'hex') + aes.final('hex');
};

export const decrypt = (encryptedText: string) => {
  const aes = crypto.createDecipheriv(algorithm, secret, iv);
  return aes.update(encryptedText, 'hex', 'utf8') + aes.final('utf8');
};
