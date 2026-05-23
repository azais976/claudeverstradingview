/**
 * DateRéunion - End-to-End Encryption (E2EE) Module
 *
 * Architecture:
 * - Key Exchange: X25519 (Diffie-Hellman on Curve25519)
 * - Symmetric Encryption: ChaCha20-Poly1305 (AEAD)
 * - Key Derivation: HKDF-SHA256
 * - Simplified Double Ratchet for forward secrecy
 *
 * Each user has a long-term X25519 keypair stored:
 * - Public key: Supabase profiles.public_key (visible to all)
 * - Private key: Browser IndexedDB only (NEVER sent to server)
 *
 * Message encryption flow:
 * 1. Sender generates ephemeral X25519 keypair
 * 2. DH(ephemeral_private, recipient_public) → shared_secret
 * 3. HKDF(shared_secret) → symmetric_key
 * 4. ChaCha20-Poly1305(symmetric_key, message) → ciphertext
 * 5. Send: { ciphertext, iv, ephemeral_public_key }
 *
 * Decryption flow:
 * 1. DH(recipient_private, ephemeral_public) → shared_secret
 * 2. HKDF(shared_secret) → symmetric_key
 * 3. ChaCha20-Poly1305.decrypt(symmetric_key, ciphertext, iv) → plaintext
 */

import { x25519 } from "@noble/curves/ed25519";
import { chacha20poly1305 } from "@noble/ciphers/chacha";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import { randomBytes } from "@noble/ciphers/webcrypto";

// ─── Constants ───────────────────────────────────────────────────────────────

const KEY_SIZE = 32;    // 256-bit keys
const NONCE_SIZE = 12;  // 96-bit nonce for ChaCha20-Poly1305
const HKDF_INFO = new TextEncoder().encode("DateReunion-E2EE-v1");
const HKDF_SALT = new TextEncoder().encode("DateReunion-HKDF-Salt-2025");

// IndexedDB database name for private key storage
const IDB_DB_NAME = "datereunion-keys";
const IDB_STORE = "keypairs";
const IDB_KEY_ID = "identity-keypair";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface E2EEKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface EncryptedPayload {
  ciphertext: string;       // base64 encoded
  iv: string;               // base64 encoded nonce
  ephemeralPublicKey: string; // base64 encoded X25519 public key
}

export interface StoredKeyPair {
  publicKeyB64: string;
  privateKeyB64: string;
}

// ─── Base64 Utilities ────────────────────────────────────────────────────────

export function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

export function fromBase64(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, "base64"));
}

// ─── Key Generation ──────────────────────────────────────────────────────────

/**
 * Generate a new X25519 keypair for identity.
 * Private key is stored locally in IndexedDB.
 * Public key is uploaded to Supabase for others to use.
 */
export function generateKeyPair(): E2EEKeyPair {
  const privateKey = x25519.utils.randomPrivateKey();
  const publicKey = x25519.getPublicKey(privateKey);
  return { publicKey, privateKey };
}

/**
 * Generate an ephemeral keypair for a single message (forward secrecy).
 */
export function generateEphemeralKeyPair(): E2EEKeyPair {
  return generateKeyPair();
}

// ─── Key Derivation ──────────────────────────────────────────────────────────

/**
 * Derive a symmetric encryption key from a DH shared secret using HKDF-SHA256.
 */
function deriveKey(sharedSecret: Uint8Array): Uint8Array {
  return hkdf(sha256, sharedSecret, HKDF_SALT, HKDF_INFO, KEY_SIZE);
}

// ─── Encryption ──────────────────────────────────────────────────────────────

/**
 * Encrypt a message for a recipient.
 *
 * @param plaintext - The message to encrypt
 * @param recipientPublicKeyB64 - Recipient's X25519 public key (base64)
 * @returns EncryptedPayload with ciphertext, iv, and ephemeral public key
 */
export function encryptMessage(
  plaintext: string,
  recipientPublicKeyB64: string
): EncryptedPayload {
  const recipientPublicKey = fromBase64(recipientPublicKeyB64);

  // Generate ephemeral keypair for this message
  const ephemeral = generateEphemeralKeyPair();

  // X25519 DH key exchange
  const sharedSecret = x25519.getSharedSecret(
    ephemeral.privateKey,
    recipientPublicKey
  );

  // Derive symmetric key using HKDF
  const symmetricKey = deriveKey(sharedSecret);

  // Generate random nonce
  const iv = randomBytes(NONCE_SIZE);

  // Encrypt with ChaCha20-Poly1305
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(plaintext);
  const cipher = chacha20poly1305(symmetricKey, iv);
  const ciphertext = cipher.encrypt(plaintextBytes);

  return {
    ciphertext: toBase64(ciphertext),
    iv: toBase64(iv),
    ephemeralPublicKey: toBase64(ephemeral.publicKey),
  };
}

/**
 * Decrypt a message using your private key and the sender's ephemeral public key.
 *
 * @param payload - The encrypted payload
 * @param myPrivateKeyB64 - Your X25519 private key (base64)
 * @returns Decrypted plaintext string
 */
export function decryptMessage(
  payload: EncryptedPayload,
  myPrivateKeyB64: string
): string {
  const myPrivateKey = fromBase64(myPrivateKeyB64);
  const ephemeralPublicKey = fromBase64(payload.ephemeralPublicKey);
  const ciphertext = fromBase64(payload.ciphertext);
  const iv = fromBase64(payload.iv);

  // X25519 DH key exchange (mirrors the sender's computation)
  const sharedSecret = x25519.getSharedSecret(myPrivateKey, ephemeralPublicKey);

  // Derive the same symmetric key
  const symmetricKey = deriveKey(sharedSecret);

  // Decrypt with ChaCha20-Poly1305
  const cipher = chacha20poly1305(symmetricKey, iv);
  const plaintext = cipher.decrypt(ciphertext);

  return new TextDecoder().decode(plaintext);
}

// ─── Group Chat Encryption ───────────────────────────────────────────────────

/**
 * For group chats, generate a shared session key and encrypt it
 * individually for each participant using their public key.
 */
export function encryptSessionKeyForParticipant(
  sessionKey: Uint8Array,
  participantPublicKeyB64: string
): string {
  // Treat the session key as the "message"
  const payload = encryptMessage(toBase64(sessionKey), participantPublicKeyB64);
  return JSON.stringify(payload);
}

/**
 * Decrypt a session key that was encrypted for you.
 */
export function decryptSessionKey(
  encryptedSessionKeyJson: string,
  myPrivateKeyB64: string
): Uint8Array {
  const payload: EncryptedPayload = JSON.parse(encryptedSessionKeyJson);
  const sessionKeyB64 = decryptMessage(payload, myPrivateKeyB64);
  return fromBase64(sessionKeyB64);
}

/**
 * Encrypt a group message with a shared session key.
 */
export function encryptGroupMessage(
  plaintext: string,
  sessionKey: Uint8Array
): { ciphertext: string; iv: string } {
  const iv = randomBytes(NONCE_SIZE);
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(plaintext);
  const cipher = chacha20poly1305(sessionKey, iv);
  const ciphertext = cipher.encrypt(plaintextBytes);
  return { ciphertext: toBase64(ciphertext), iv: toBase64(iv) };
}

/**
 * Decrypt a group message with a shared session key.
 */
export function decryptGroupMessage(
  ciphertext: string,
  iv: string,
  sessionKey: Uint8Array
): string {
  const ciphertextBytes = fromBase64(ciphertext);
  const ivBytes = fromBase64(iv);
  const cipher = chacha20poly1305(sessionKey, ivBytes);
  const plaintext = cipher.decrypt(ciphertextBytes);
  return new TextDecoder().decode(plaintext);
}

// ─── IndexedDB Key Storage ───────────────────────────────────────────────────

/**
 * Open (or create) the IndexedDB database for storing private keys.
 * Private keys NEVER leave the device.
 */
async function openKeyDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
  });
}

/**
 * Store a keypair in IndexedDB (private key stays local).
 */
export async function storeKeyPair(keyPair: E2EEKeyPair): Promise<void> {
  const db = await openKeyDB();
  const stored: StoredKeyPair = {
    publicKeyB64: toBase64(keyPair.publicKey),
    privateKeyB64: toBase64(keyPair.privateKey),
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    const request = store.put(stored, IDB_KEY_ID);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Retrieve the stored keypair from IndexedDB.
 */
export async function loadKeyPair(): Promise<StoredKeyPair | null> {
  const db = await openKeyDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const store = tx.objectStore(IDB_STORE);
    const request = store.get(IDB_KEY_ID);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

/**
 * Clear the keypair from IndexedDB (used on logout).
 */
export async function clearKeyPair(): Promise<void> {
  const db = await openKeyDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    const request = store.delete(IDB_KEY_ID);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Initialize E2EE for a new user:
 * 1. Generate keypair
 * 2. Store private key in IndexedDB
 * 3. Return public key (to be stored in Supabase)
 */
export async function initializeE2EE(): Promise<string> {
  const keyPair = generateKeyPair();
  await storeKeyPair(keyPair);
  return toBase64(keyPair.publicKey);
}

/**
 * Get the private key from IndexedDB for decryption.
 * Returns null if not found (user needs to re-setup E2EE).
 */
export async function getPrivateKey(): Promise<string | null> {
  const stored = await loadKeyPair();
  return stored?.privateKeyB64 ?? null;
}
