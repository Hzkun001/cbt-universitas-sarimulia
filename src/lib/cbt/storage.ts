// Client-side storage helpers. This module runs in the browser, so it
// must not import anything from `node:*` (Vite externalizes those
// imports in the browser bundle and throws at runtime). The original
// implementation re-exported `uid` from `@/lib/server/db/id`, which
// transitively pulled in `node:crypto` and broke any admin route that
// generated row ids (Vite error: "Module 'node:crypto' has been
// externalized for browser compatibility").
//
// Server code should keep using `@/lib/server/db/id` (which uses
// `node:crypto.randomBytes` for stronger entropy). Client code uses the
// `globalThis.crypto.getRandomValues` Web Crypto primitive, which is
// available in Node 19+ and every modern browser.

export function read<T>(_key: string, fallback: T): T {
  return fallback;
}

export function write<T>(_key: string, _value: T): void {}

export function remove(_key: string): void {}

export function clearAll(): void {}

// Lightweight base64url encoder that does not require Buffer / Node APIs.
// We use it to render the random bytes from `getRandomValues` into a
// compact, URL-safe string.
const BASE64URL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function bytesToBase64Url(bytes: Uint8Array, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    const b = bytes[i] ?? 0;
    out += BASE64URL_ALPHABET[b & 0x3f];
  }
  return out;
}

export function uid(prefix = ""): string {
  const bytes = new Uint8Array(10);
  globalThis.crypto.getRandomValues(bytes);
  return prefix + bytesToBase64Url(bytes, 16);
}
