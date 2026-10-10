/**
 * Config detector: age IDENTITY (private) keys committed to disk. The secrets
 * detector flags age *recipients* (`age1…` public keys); this flags the far worse
 * case — an `AGE-SECRET-KEY-1…` private identity checked into a repo or config.
 * age identities are X25519 secret keys: a classical key-agreement secret that,
 * once leaked or committed, lets an attacker decrypt every age-wrapped payload
 * addressed to it (harvest-now-decrypt-later, and retroactively un-fixable if the
 * ciphertext is already in git history).
 *
 * The matched value IS the private key, so it is marked sensitive and reporters
 * drop the snippet.
 */
import type { Detector } from "../types.js";
/** Detects committed age identity (private) keys. */
export declare const ageDetector: Detector;
//# sourceMappingURL=age.d.ts.map