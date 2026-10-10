/**
 * Config detector: classical key exchange in network transport / VPN config —
 * WireGuard and IPsec (strongSwan). These are the tunnels carrying "communication
 * between things"; their key exchange is classical and so harvest-now-decrypt-later
 * exposed (a recorded tunnel is decryptable once a CRQC exists).
 *
 * Covered (each gated so it only fires inside the relevant config):
 *  - **WireGuard** — `[Interface]`/`[Peer]` sections with `PrivateKey`/`PublicKey`.
 *    WireGuard's Noise handshake is Curve25519 with NO standard PQC option, so this
 *    is an especially sharp finding: it cannot be made quantum-safe without a
 *    tunnel-wrapping layer. The private key is treated as sensitive key material.
 *  - **IPsec / strongSwan** — IKE/ESP proposals naming classical DH groups
 *    (`modp*` = finite-field DH, `ecp*` = ECDH).
 *
 * `sshd_config` / `ssh_config` KexAlgorithms are intentionally NOT handled here —
 * the language-agnostic SSH token detector in `source.ts` (`ssh-kex-classical`)
 * already covers them; a rule here would double-count.
 */
import type { Detector } from "../types.js";
/** Detects classical key exchange in WireGuard / IPsec network config. */
export declare const vpnDetector: Detector;
//# sourceMappingURL=vpn.d.ts.map