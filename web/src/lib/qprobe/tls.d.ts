/**
 * TLS endpoint inspection. Two engines:
 *  1. `probeTlsNegotiated` — a normal `node:tls` handshake to read what the server
 *     actually negotiates: TLS version, cipher suite, ephemeral key-exchange group
 *     (the harvestable part), and the leaf certificate's public-key type/size.
 *  2. `probeHybridSupport` — a raw ClientHello (clienthello.ts) advertising
 *     X25519MLKEM768, to detect PQC-HYBRID support that Node's bundled OpenSSL
 *     cannot itself negotiate.
 *
 * `engine disposes`: we read the negotiated reality and disconnect; we never
 * modify the endpoint.
 */
import { type TLSSocket } from "node:tls";
export interface TlsNegotiated {
    protocol?: string;
    cipher?: string;
    /** Ephemeral key-exchange group, e.g. "X25519", "P-256", "DH". */
    kexGroup?: string;
    kexType?: string;
    /** Leaf certificate public-key summary. */
    certKeyType?: string;
    certKeyBits?: number;
    certSubject?: string;
    /** How the leaf certificate is SIGNED (the CA's algorithm) — e.g. "RSA", "ECDSA". */
    certSigFamily?: string;
    certSigOid?: string;
    error?: string;
}
/** Read the negotiated parameters + leaf-cert posture from a connected TLS socket. */
export declare function extractNegotiated(socket: TLSSocket): TlsNegotiated;
/** Perform a normal TLS handshake and read the negotiated parameters. */
export declare function probeTlsNegotiated(host: string, port: number, opts?: {
    servername?: string;
    timeoutMs?: number;
}): Promise<TlsNegotiated>;
export interface HybridSupport {
    /** True only when the server SELECTED the hybrid group (proof of support). */
    hybridSelected: boolean;
    selectedGroup?: number;
    isHelloRetryRequest?: boolean;
    negotiatedVersion?: number;
    error?: string;
}
/**
 * Send a raw ClientHello advertising X25519MLKEM768 and read the group the server
 * selects. A server that supports+prefers the hybrid group answers with a
 * HelloRetryRequest selecting 0x11EC — positive proof of PQC-hybrid support.
 */
export declare function probeHybridSupport(host: string, port: number, opts?: {
    servername?: string;
    timeoutMs?: number;
}): Promise<HybridSupport>;
//# sourceMappingURL=tls.d.ts.map