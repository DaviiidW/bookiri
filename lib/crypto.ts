import bcrypt from "bcryptjs";

/**
 * Hashes a plaintext password using bcryptjs.
 * @param password The plaintext password to hash
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 * @param password The plaintext password
 * @param hash The stored bcrypt hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}
