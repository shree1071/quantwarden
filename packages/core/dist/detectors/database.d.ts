/**
 * Config detector: classical crypto in database usage — public-key encryption of
 * stored data (pgcrypto) and weak client TLS posture. Data-at-rest is the sharpest
 * harvest-now-decrypt-later target: a column encrypted to an RSA key today is a
 * time capsule an adversary can hold until key recovery is cheap.
 *
 * Covered:
 *  - pgcrypto `pgp_pub_encrypt` / `pgp_pub_decrypt` in `.sql` (RSA/ElGamal public-key
 *    encryption of column data) → `hndl:true`.
 *  - libpq `sslmode = allow | prefer | require` in any config/connection file — a
 *    mode that does NOT verify the server certificate, so the classical TLS session
 *    it negotiates is both MITM-able and harvestable. `disable` is excluded: it
 *    negotiates no TLS at all, so there is no key exchange to harvest (a plaintext
 *    concern, out of scope for a PQC-readiness scanner).
 */
import type { Detector } from "../types.js";
/** Detects classical database at-rest / transport crypto. */
export declare const databaseDetector: Detector;
//# sourceMappingURL=database.d.ts.map