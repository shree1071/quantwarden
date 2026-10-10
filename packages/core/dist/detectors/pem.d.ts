/**
 * Config / certificate detector: finds PEM-encoded cryptographic material in
 * any text file (source, config, .pem, .key, .crt, .env, …). This catches
 * embedded private keys and X.509 certificates regardless of language.
 *
 * Every rule's metadata lives in the {@link RuleMeta} declaration below (the
 * catalog entry); `detect()` builds findings straight from it via
 * `findingFromRule`. All PEM findings are high-confidence exact-marker matches.
 */
import type { Detector } from "../types.js";
/** Detects PEM key/certificate material in arbitrary files. */
export declare const pemDetector: Detector;
//# sourceMappingURL=pem.d.ts.map