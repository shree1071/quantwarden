/**
 * Map live-probe results onto `@quantakrypto/core` Findings, so qProbe output
 * scores and reports through the same engine as qScan (buildInventory, toSarif,
 * toJson, toCbom). A positive result (PQC-hybrid TLS selected, or PQC SSH KEX
 * offered) intentionally emits NO finding — good news keeps the readiness score
 * high; it is surfaced separately in the human summary.
 *
 * Findings are synthesised with `location.file = "host:port"` and line 1, since a
 * live endpoint has no source position.
 */
import type { Finding } from "@quantakrypto/core";
import type { Target } from "./target.js";
import type { TlsNegotiated, HybridSupport } from "./tls.js";
import type { SshProbeResult } from "./ssh.js";
/** Findings for a TLS endpoint from the negotiated params + the hybrid probe. */
export declare function classifyTls(target: Target, neg: TlsNegotiated, hybrid: HybridSupport): Finding[];
/** Findings for an SSH endpoint from its KEXINIT. */
export declare function classifySsh(target: Target, ssh: SshProbeResult): Finding[];
//# sourceMappingURL=classify.d.ts.map