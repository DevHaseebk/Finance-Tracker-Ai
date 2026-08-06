// Form validation shared by the Login and Sign Up screens.
// Each validator returns an error string, or null when the value is valid.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8;

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) return 'Email is required.';
  if (!EMAIL_RE.test(value)) return 'Enter a valid email address.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

export const MAX_CATEGORY_NAME_LENGTH = 40;

export function validateCategoryName(name: string): string | null {
  const value = name.trim();
  if (!value) return 'Category name is required.';
  if (value.length > MAX_CATEGORY_NAME_LENGTH) {
    return `Keep it under ${MAX_CATEGORY_NAME_LENGTH} characters.`;
  }
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirm: string
): string | null {
  if (!confirm) return 'Please confirm your password.';
  if (password !== confirm) return 'Passwords do not match.';
  return null;
}

// Supabase auth errors are terse and sometimes leak implementation detail.
// Map the common ones to something a user can act on.
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();

  if (m.includes('invalid login credentials')) {
    return 'That email or password is incorrect.';
  }
  if (m.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }
  if (m.includes('user already registered') || m.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (m.includes('password should be at least')) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (m.includes('rate limit') || m.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (m.includes('network') || m.includes('fetch')) {
    return 'Network error. Check your connection and try again.';
  }
  return message;
}

// Postgres SQLSTATE codes returned by Supabase's REST error payload.
const PG_CHECK_VIOLATION = '23514';
const PG_FOREIGN_KEY_VIOLATION = '23503';

/** Maps errors from deleting a category to something a user can act on. */
export function friendlyCategoryDeleteError(error: { code?: string; message: string }): string {
  if (error.code === PG_CHECK_VIOLATION) {
    return "Default categories can't be deleted — hide them instead.";
  }
  if (error.code === PG_FOREIGN_KEY_VIOLATION) {
    return 'This category is used by existing transactions and can’t be deleted.';
  }
  return error.message;
}
