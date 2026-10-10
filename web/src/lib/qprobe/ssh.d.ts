/** PQC / hybrid SSH key-exchange algorithm names (OpenSSH + drafts). */
export declare const PQ_SSH_KEX: string[];
export interface KexInit {
    kexAlgorithms: string[];
    hostKeyAlgorithms: string[];
}
/**
 * Parse an SSH_MSG_KEXINIT payload (starting at the message-code byte) into its
 * kex and host-key algorithm name-lists.
 */
export declare function parseKexinit(payload: Buffer): KexInit;
/**
 * Extract the first binary SSH packet's payload from a raw server buffer that
 * begins after the identification banner line. Returns undefined if the packet is
 * not yet complete.
 */
export declare function extractPacketPayload(afterBanner: Buffer): Buffer | undefined;
/** Locate the end of the SSH identification banner line (`SSH-...\n`). */
export declare function bannerEnd(buf: Buffer): number | undefined;
export interface SshProbeResult {
    banner?: string;
    kex?: KexInit;
    pqKexOffered: boolean;
    error?: string;
}
/** Connect to an SSH endpoint and read its KEXINIT (no auth, no crypto). */
export declare function probeSsh(host: string, port: number, timeoutMs?: number): Promise<SshProbeResult>;
//# sourceMappingURL=ssh.d.ts.map