/**
 * Config / source-agnostic detector: stateful hash-based signatures
 * (NIST SP 800-208) — LMS, HSS, XMSS and XMSSMT.
 *
 * These schemes ARE quantum-safe and NIST-approved (SP 800-208, for firmware /
 * secure-boot signing), so this is NOT a "broken crypto" finding. The hazard it
 * flags is STATE MANAGEMENT: each private key holds a bounded set of one-time
 * key indices, and reusing an index is catastrophic (it enables signature
 * forgery). The detector therefore surfaces the usage so a reviewer can confirm
 * rigorous state handling exists — or migrate to a stateless scheme.
 *
 * Like {@link pemDetector}, this is a `scope: "config"`, `language: "any"`
 * detector that runs on every text file, because the distinctive LMS/XMSS
 * parameter strings and library tokens (`LMS_SHA256_M32_H10`, `pyhsslms`,
 * `XMSS-SHA2_10_256`, …) appear identically across languages, config, and docs.
 * Every rule's metadata lives in the {@link RuleMeta} declaration below; the
 * regexes are tightly bounded and `\b`-anchored to stay high-signal.
 */
import type { Detector } from "../types.js";
/** Detects stateful hash-based signature (SP 800-208) usage in arbitrary files. */
export declare const statefulHbsDetector: Detector;
//# sourceMappingURL=stateful-hbs.d.ts.map