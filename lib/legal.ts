/**
 * Legal data for Impressum & Datenschutz.
 *
 * Strategy: read from process.env.* so personal data stays out of git history.
 * Set in .env.local (development) and Vercel Project Settings (production).
 * See .env.example for required keys.
 *
 * Fail-fast on missing values: a deploy without proper env config should
 * break the build, not silently render an incomplete legal page.
 */

export interface LegalData {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCity: string;
  email: string;
}

function required(key: string): string {
  const v = process.env[key];
  if (!v || v.trim() === "") {
    throw new Error(
      `Missing required env var: ${key}. Set it in .env.local (dev) or Vercel Project Settings (prod). See .env.example.`
    );
  }
  return v.trim();
}

export function getLegalData(): LegalData {
  return {
    name: required("IMPRESSUM_NAME"),
    addressLine1: required("IMPRESSUM_ADDRESS_LINE1"),
    addressLine2: required("IMPRESSUM_ADDRESS_LINE2"),
    zipCity: required("IMPRESSUM_ZIP_CITY"),
    email: required("IMPRESSUM_EMAIL"),
  };
}
