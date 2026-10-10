/**
 * Config detector: classical cryptographic KEYSTORES committed to a repository —
 * Java KeyStore (JKS), JCEKS, PKCS#12 (.p12/.pfx), and BouncyCastle (.bks). These
 * binary containers hold private keys and certificate chains, essentially always
 * classical (RSA / EC / DSA). A keystore in version control is committed key
 * material: harvest-now-decrypt-later exposed and retroactively un-fixable.
 *
 * The scan pipeline reads these extensions byte-preserving (latin1; see
 * {@link ../walk.ts isKeystorePath} and scan.ts), so `content.charCodeAt(i)` is the
 * i-th file byte and we can identify the container by its magic number. We do NOT
 * parse the enclosed key algorithm (that needs full ASN.1 / proprietary parsing);
 * flagging the presence of a classical keystore is the actionable signal.
 *
 * The match is sensitive key material, so reporters drop the (binary) snippet.
 */
import type { Detector } from "../types.js";
/** Detects committed classical keystores by magic number / extension. */
export declare const keystoreDetector: Detector;
//# sourceMappingURL=keystore.d.ts.map