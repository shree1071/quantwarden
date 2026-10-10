import { type TlsNegotiated } from "./tls.js";
/** A one-shot line-based STARTTLS dialog: send `command`, expect `success`, upgrade. */
interface StartTlsDialog {
    /** The upgrade command to send after the server greeting. */
    command: string;
    /** Matches the server reply that grants the TLS upgrade. */
    success: RegExp;
}
/** IMAP (RFC 3501): `* OK` greeting → `a1 STARTTLS` → `a1 OK`. */
export declare const IMAP_DIALOG: StartTlsDialog;
/** POP3 (RFC 2595): `+OK` greeting → `STLS` → `+OK`. */
export declare const POP3_DIALOG: StartTlsDialog;
/**
 * Probe a line-based STARTTLS endpoint (IMAP/POP3): read the greeting line, send
 * the upgrade command, and on a success reply upgrade to TLS and read the
 * negotiated parameters + certificate posture. Returns `{ error }` when the server
 * does not offer the upgrade or it fails.
 */
export declare function probeLineStartTls(host: string, port: number, dialog: StartTlsDialog, opts?: {
    servername?: string;
    timeoutMs?: number;
}): Promise<TlsNegotiated>;
export {};
//# sourceMappingURL=starttls.d.ts.map