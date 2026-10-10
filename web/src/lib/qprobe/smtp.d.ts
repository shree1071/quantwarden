import { type TlsNegotiated } from "./tls.js";
/** True once `buf` contains a COMPLETE SMTP reply (last line is `NNN␠…`). */
export declare function smtpReplyComplete(buf: string): boolean;
/** True if an EHLO reply advertises the STARTTLS capability. */
export declare function smtpAdvertisesStartTls(ehlo: string): boolean;
/**
 * Probe an SMTP endpoint: dial, EHLO, STARTTLS, upgrade to TLS, and read the
 * negotiated parameters + certificate posture. Returns `{ error }` when the server
 * does not offer STARTTLS or the upgrade fails.
 */
export declare function probeSmtpStartTls(host: string, port: number, opts?: {
    servername?: string;
    timeoutMs?: number;
}): Promise<TlsNegotiated>;
//# sourceMappingURL=smtp.d.ts.map