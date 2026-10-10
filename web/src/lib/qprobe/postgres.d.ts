import { type TlsNegotiated } from "./tls.js";
/** The 8-byte libpq SSLRequest message: length(0x00000008) + code(80877103). */
export declare function sslRequestFrame(): Buffer;
/** Probe a PostgreSQL endpoint: send SSLRequest, and on `S` upgrade to TLS. */
export declare function probePostgresSsl(host: string, port: number, opts?: {
    servername?: string;
    timeoutMs?: number;
}): Promise<TlsNegotiated>;
//# sourceMappingURL=postgres.d.ts.map