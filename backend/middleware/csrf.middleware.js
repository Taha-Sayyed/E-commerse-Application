import csurf from 'csurf';
import { ENV } from "../lib/env.js"

/**
 * csurf middleware configured to read the CSRF token from
 * the 'x-csrf-token' request header.
 *
 * cookie: true  → stores the CSRF secret in a signed cookie (_csrf)
 *                 instead of the session, so no session library is needed.
 */
export const csrfProtection = csurf({
  cookie: {
    httpOnly: true,   // JS cannot read the _csrf secret cookie
    secure: ENV.NODE_ENV === 'production',
    sameSite: 'strict',
    signed: true,     // requires cookie-parser secret (see below)
  },
});

/**
 * Error handler for CSRF token mismatch.
 * Must be placed AFTER routes that use csrfProtection.
 */
export const csrfErrorHandler = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ message: 'Invalid or missing CSRF token' });
  }
  next(err);
};
