const crypto = require('crypto');

// AES-256-GCM encryption for per-tenant integration secrets (plan §5).
// Secrets are stored on the control-plane Tenant row as ciphertext and only
// decrypted in-memory by the integration factories at request time.
//
// INTEGRATION_ENC_KEY must be a 32-byte key. Accepts either:
//   - 64 hex chars  (e.g. `openssl rand -hex 32`)
//   - 44 base64 chars ending in '=' (e.g. `openssl rand -base64 32`)
//   - a raw 32-char utf8 string (least preferred)
const ALGO = 'aes-256-gcm';
const IV_LEN = 12;   // 96-bit nonce, recommended for GCM
const TAG_LEN = 16;  // 128-bit auth tag

function loadKey() {
  const raw = process.env.INTEGRATION_ENC_KEY;
  if (!raw) {
    throw new Error(
      'INTEGRATION_ENC_KEY is not set. A 32-byte key is required to encrypt/decrypt ' +
      'tenant integration secrets. Generate one with: openssl rand -hex 32'
    );
  }
  // hex
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, 'hex');
  // base64 (32 bytes -> 44 chars with padding)
  if (/^[A-Za-z0-9+/]{43}=$/.test(raw)) {
    const b = Buffer.from(raw, 'base64');
    if (b.length === 32) return b;
  }
  // raw utf8
  const utf8 = Buffer.from(raw, 'utf8');
  if (utf8.length === 32) return utf8;

  throw new Error(
    'INTEGRATION_ENC_KEY must be 32 bytes (64 hex chars, base64-encoded 32 bytes, ' +
    'or a 32-char string). Got an unsupported length.'
  );
}

// Resolve the key lazily on first use so importing this module never throws at
// require time (e.g. in tooling that doesn't need crypto).
let KEY = null;
function key() {
  if (!KEY) KEY = loadKey();
  return KEY;
}

// Returns "iv:tag:cipher", each segment base64.
function encrypt(plain) {
  if (plain == null) return null;
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key(), iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}

// Reverses encrypt(). Throws if the ciphertext is malformed or the auth tag
// fails (tampering / wrong key).
function decrypt(enc) {
  if (enc == null) return null;
  const parts = String(enc).split(':');
  if (parts.length !== 3) {
    throw new Error('Malformed ciphertext: expected "iv:tag:cipher".');
  }
  const [ivB64, tagB64, dataB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');
  if (iv.length !== IV_LEN || tag.length !== TAG_LEN) {
    throw new Error('Malformed ciphertext: bad iv/tag length.');
  }
  const decipher = crypto.createDecipheriv(ALGO, key(), iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString('utf8');
}

module.exports = { encrypt, decrypt };
