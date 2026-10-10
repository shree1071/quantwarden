/** A raw 32-byte X25519 public key (from node:crypto — a real, valid key). */
export declare function x25519RawPublic(): Buffer;
export declare const GROUP_X25519 = 29;
export declare const GROUP_X25519MLKEM768 = 4588;
export declare const GROUP_SECP256R1 = 23;
/**
 * Build a raw ClientHello TLS record advertising the hybrid group. `keyShareGroup`
 * is the group we actually send a key_share for (default x25519), while
 * `supportedGroups` is what we advertise (hybrid first).
 */
export declare function buildClientHello(opts: {
    serverName?: string;
    supportedGroups?: number[];
    keyShareGroup?: number;
}): Buffer;
/** A parsed TLS record. */
export interface TlsRecord {
    type: number;
    fragment: Buffer;
}
/** Split a buffer into TLS records. Stops at the first truncated record. */
export declare function parseRecords(buf: Buffer): TlsRecord[];
/** The result of reading a ServerHello / HelloRetryRequest. */
export interface ServerHelloInfo {
    isHelloRetryRequest: boolean;
    /** Group named in the key_share extension (selected group), if present. */
    selectedGroup?: number;
    /** Negotiated version from supported_versions (0x0304 for TLS 1.3), if present. */
    negotiatedVersion?: number;
    cipherSuite?: number;
}
/**
 * Parse a ServerHello handshake message body (the bytes AFTER the 4-byte handshake
 * header) and extract the selected group + negotiated version. Handles both a
 * normal ServerHello (key_share carries group + key) and a HelloRetryRequest
 * (key_share carries just the selected group) — in both the first 2 bytes of the
 * key_share body are the group.
 */
export declare function parseServerHelloBody(body: Buffer): ServerHelloInfo;
/** Read the first ServerHello/HRR out of a raw response buffer, if any. */
export declare function readServerHello(raw: Buffer): ServerHelloInfo | undefined;
//# sourceMappingURL=clienthello.d.ts.map