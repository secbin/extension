import { Storage } from '../../constants';

// Must be declared before jest.mock due to hoisting
const mockGetSyncItemAsync = jest.fn();

jest.mock('./storage', () => ({
  getSyncItemAsync: (...args: any[]) => mockGetSyncItemAsync(...args),
  setSyncItem: jest.fn(),
}));

import { encrypt, decrypt } from './crypto';

function setStorageValues(mode: string, keyLen: number) {
  mockGetSyncItemAsync.mockImplementation((key: string) => {
    if (key === Storage.ENC_MODE) return Promise.resolve(mode);
    if (key === Storage.KEY_LENGTH) return Promise.resolve(keyLen);
    return Promise.resolve(undefined);
  });
}

describe('crypto', () => {
  describe('AES-GCM (default)', () => {
    beforeEach(() => setStorageValues('AES-GCM', 16));

    it('encrypts and decrypts plaintext round-trip', async () => {
      const plaintext = 'Hello, SecureBin!';
      const result = await encrypt(plaintext);

      expect(result.data).toBeDefined();
      expect(result.key).toBeDefined();
      expect(result.mode).toBe('AES-GCM');
      expect(result.key_len).toBe(16);

      const parsed = JSON.parse(result.data);
      expect(parsed.C_TXT).toBeDefined();
      expect(parsed.IV).toBeDefined();

      const decrypted = decrypt(result.data, result.key);
      expect(decrypted).toBe(plaintext);
    });

    it('produces different ciphertexts for the same plaintext (random IV)', async () => {
      const plaintext = 'same input';
      const r1 = await encrypt(plaintext);
      const r2 = await encrypt(plaintext);
      expect(r1.data).not.toBe(r2.data);
    });

    it('uses password-based key derivation when passkey provided', async () => {
      const plaintext = 'secret message';
      const password = 'mypassword';
      const result = await encrypt(plaintext, password);

      expect(result.key).toBe(password);
      const parsed = JSON.parse(result.data);
      expect(parsed.Salt).toBeDefined();
      expect(parsed.Length).toBe(16);

      const decrypted = decrypt(result.data, password);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('AES-CBC', () => {
    beforeEach(() => setStorageValues('AES-CBC', 16));

    it('encrypts and decrypts round-trip', async () => {
      const plaintext = 'CBC mode test';
      const result = await encrypt(plaintext);
      const decrypted = decrypt(result.data, result.key);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('AES-CTR', () => {
    beforeEach(() => setStorageValues('AES-CTR', 16));

    it('encrypts and decrypts round-trip', async () => {
      const plaintext = 'CTR mode test';
      const result = await encrypt(plaintext);
      const decrypted = decrypt(result.data, result.key);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('key lengths', () => {
    it.each([
      ['AES-GCM', 16],
      ['AES-GCM', 24],
      ['AES-GCM', 32],
    ] as [string, number][])(
      'encrypts/decrypts with mode=%s keyLen=%i',
      async (mode, len) => {
        setStorageValues(mode, len);
        const plaintext = 'key length test';
        const result = await encrypt(plaintext);
        expect(result.key_len).toBe(len);
        expect(decrypt(result.data, result.key)).toBe(plaintext);
      }
    );
  });

  describe('decrypt', () => {
    it('throws when ciphertext is malformed JSON', () => {
      expect(() => decrypt('not-json', 'key')).toThrow();
    });

    it('handles unicode plaintext', async () => {
      setStorageValues('AES-GCM', 16);
      const plaintext = 'hello world unicode';
      const result = await encrypt(plaintext);
      expect(decrypt(result.data, result.key)).toBe(plaintext);
    });
  });
});
