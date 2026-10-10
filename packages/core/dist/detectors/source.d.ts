/**
 * Source-code detectors for classical, non-quantum-safe asymmetric cryptography
 * in JavaScript / TypeScript. Each detector is pure and stateless: it declares
 * which files it applies to, the catalog of rules it can emit (`rules`), and
 * returns zero or more Findings for a file's contents.
 *
 * Rule metadata (title / severity / category / remediation / …) lives ONCE in
 * the per-detector `RuleMeta` declarations below, not inline in `detect()`.
 * `detect()` builds findings from those declarations via `findingFromRule`,
 * overriding only the fields that genuinely vary per match (e.g. the concrete
 * algorithm family of a `generateKeyPair('ec')` call). The declarations are the
 * catalog surfaced by the registry, SARIF `rules[]`, and the MCP resolver.
 *
 * The detection strategy is deliberately lexical (regex over source text). This
 * is robust to bundling and partial files and keeps the package dependency-free.
 * Confidence is set per-pattern to reflect how specific the match is.
 *
 * All per-file regexes are precompiled at module scope (not re-created per
 * file) — `eachMatch` clones a fresh stateful copy only when a regex lacks the
 * global flag, and these are all global, so they are reused safely.
 *
 * HNDL (harvest-now-decrypt-later) policy:
 *   - confidentiality primitives (key exchange / KEM: ECDH, DH, RSA-OAEP) → hndl:true
 *   - signatures (RSA-PSS, ECDSA, EdDSA, DSA, JWT alg) → hndl:false, but still high
 *     severity because a quantum attacker can forge them.
 *   - EC keygen is ambiguous (an 'ec' key feeds BOTH ECDSA and ECDH); it is
 *     classified conservatively as key-exchange-capable (hndl:true).
 */
import type { Detector } from "../types.js";
/** All built-in source/config detectors, in run order. */
export declare const sourceDetectors: Detector[];
//# sourceMappingURL=source.d.ts.map