/**
 * Config detector: classical supply-chain / artifact signing beyond the cosign +
 * GPG cases the `cicd` detector covers — Docker Content Trust (Notary v1 / TUF),
 * CNCF Notation, and in-toto. These sign container images, OCI artifacts, and
 * build provenance with classical keys (ECDSA / RSA / Ed25519). Like all signing,
 * this is the signature-side analogue of harvest-now-decrypt-later: a signature
 * produced today is forgeable once a CRQC exists, and the signed artifact keeps
 * verifying against that classical key for years — so these are `hndl:false` but
 * real quantum-migration debt.
 *
 * Gated to CI pipeline files, Dockerfiles, and shell scripts, over comment-masked
 * content, and keyed on distinctive command/env tokens to keep false positives low.
 */
import type { Detector } from "../types.js";
/** Detects classical Docker Content Trust / Notation / in-toto signing. */
export declare const supplyChainDetector: Detector;
//# sourceMappingURL=supply-chain.d.ts.map