import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';

  private getKey(): Buffer {
    return crypto
      .createHash('sha256')
      .update(process.env.ENCRYPTION_KEY || 'default-secret')
      .digest();
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(
      this.algorithm,
      this.getKey(),
      iv,
    );

    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(value: string): string {
    const [ivHex, tagHex, encryptedHex] = value.split(':');

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.getKey(),
      Buffer.from(ivHex, 'hex'),
    );

    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

    return Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, 'hex')),
      decipher.final(),
    ]).toString('utf8');
  }
}