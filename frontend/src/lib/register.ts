export const MIN_REGISTER_PASSWORD_LENGTH = 8;
export const MAX_REGISTER_PASSWORD_LENGTH = 72;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function usernameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "user";
  const cleaned = local.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 18);
  const prefix = (cleaned.length >= 3 ? cleaned : `user${cleaned}`).slice(0, 18);
  const suffix = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${suffix}`.slice(0, 30);
}

export function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(email);
}
