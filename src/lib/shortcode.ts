import { customAlphabet } from "nanoid";

export function generateShortCode(length = 11) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const nanoid = customAlphabet(alphabet, length);
  return nanoid();
}