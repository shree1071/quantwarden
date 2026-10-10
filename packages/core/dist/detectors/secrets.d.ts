/**
 * Config detector: secrets encrypted at rest with classical asymmetric key
 * wrapping. This is the purest "harvest now, decrypt later" surface — the
 * ciphertext is often committed to a git repository, which means it is already
 * replicated, effectively immortal, and retroactively un-fixable (you can
 * re-encrypt HEAD, not history). Every recipient key here is classical.
 *
 * Covered:
 *  - Mozilla SOPS / age recipients: `age1…` bech32 public keys (X25519 key
 *    agreement wrapping the data key).
 *  - Bitnami Sealed Secrets: `kind: SealedSecret` (controller wraps with RSA-OAEP).
 *
 * Armored PGP blocks (`-----BEGIN PGP MESSAGE-----` and PGP private keys) are owned
 * by the PEM detector (`pem-pgp-message` / `pem-pgp-private-key`), so they are not
 * duplicated here.
 *
 * Symmetric-only schemes (ansible-vault AES, age with a scrypt passphrase) are
 * intentionally NOT flagged: a strong symmetric key is only Grover-weakened, not
 * broken, so it is out of scope for a *classical-asymmetric* readiness signal.
 */
import type { Detector } from "../types.js";
/** Detects secrets encrypted at rest with classical asymmetric key wrapping. */
export declare const secretsDetector: Detector;
//# sourceMappingURL=secrets.d.ts.map