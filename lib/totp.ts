import { Secret, TOTP } from "otpauth";

/**
 * Pomožne funkcije za TOTP dvofaktorsko avtentikacijo (2FA).
 * Uporablja standard RFC 6238 (kompatibilno z Google Authenticator, Authy ...).
 */

const ISSUER = "Luka Photography";

/** Sestavi TOTP objekt iz shranjene base32 skrivnosti in oznake (e-pošta). */
function buildTOTP(secretBase32: string, label: string): TOTP {
  return new TOTP({
    issuer: ISSUER,
    label,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  });
}

/** Ustvari novo naključno skrivnost (base32) za vpis nove naprave. */
export function generateTotpSecret(): string {
  return new Secret({ size: 20 }).base32;
}

/** Vrne otpauth:// URI za QR kodo, ki jo skenira authenticator aplikacija. */
export function totpAuthUri(secretBase32: string, label: string): string {
  return buildTOTP(secretBase32, label).toString();
}

/**
 * Preveri 6-mestno kodo proti skrivnosti.
 * `window: 1` dovoli ±1 časovno okno (toleranca za zamik ure).
 */
export function verifyTotp(
  secretBase32: string,
  token: string,
  label = ISSUER
): boolean {
  const clean = token.replace(/\s/g, "");
  if (!/^\d{6}$/.test(clean)) return false;
  const delta = buildTOTP(secretBase32, label).validate({
    token: clean,
    window: 1,
  });
  return delta !== null;
}
