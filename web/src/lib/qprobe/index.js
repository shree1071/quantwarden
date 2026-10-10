import { buildInventory } from "@quantakrypto/core";
import { authorizeTargets } from "./attest.js";
import { probeTlsNegotiated, probeHybridSupport, } from "./tls.js";
import { probeSsh } from "./ssh.js";
import { probeSmtpStartTls } from "./smtp.js";
import { probeLineStartTls, IMAP_DIALOG, POP3_DIALOG } from "./starttls.js";
import { probePostgresSsl } from "./postgres.js";
import { classifyTls, classifySsh } from "./classify.js";
export { parseTarget, TargetError } from "./target.js";
export { authorizeTargets, parseOwnedHosts, AttestationError, } from "./attest.js";
export { PQ_SSH_KEX } from "./ssh.js";
export * from "./clienthello.js"; // pure byte codec — no network
export { certSignatureAlgorithm, decodeOid, oidToSignatureFamily } from "./x509.js"; // pure DER parse
export { smtpAdvertisesStartTls, smtpReplyComplete } from "./smtp.js"; // pure SMTP reply framing
export { classifyTls, classifySsh } from "./classify.js";
export { toScanResult, toSarifReport, toCbomReport, toJsonReport } from "./report.js";
/** Re-export the pure STARTTLS/SSLRequest builders for testing (not the probes). */
export { IMAP_DIALOG, POP3_DIALOG } from "./starttls.js";
export { sslRequestFrame } from "./postgres.js";
/**
 * Choose a probe mode for "auto" from the well-known port: SSH on 22, SMTP
 * STARTTLS on 25/587, IMAP on 143, POP3 on 110, PostgreSQL on 5432, TLS otherwise
 * (which covers direct-TLS services like HTTPS 443, IMAPS 993, and DoT 853).
 */
export function resolveMode(target, mode) {
    if (mode !== "auto")
        return mode;
    if (target.port === 22)
        return "ssh";
    if (target.port === 25 || target.port === 587)
        return "smtp";
    if (target.port === 143)
        return "imap";
    if (target.port === 110)
        return "pop3";
    if (target.port === 5432)
        return "postgres";
    return "tls";
}
/**
 * Probe a single endpoint. INTERNAL — not exported, because it performs network
 * I/O without checking authorization; only {@link runProbe} (which authorizes
 * first) may reach it. Assumes authorization has already been granted.
 */
async function probeEndpoint(target, mode, opts = {}) {
    const positives = [];
    if (mode === "ssh") {
        const ssh = await probeSsh(target.host, target.port, opts.timeoutMs);
        if (ssh.pqKexOffered)
            positives.push("PQC SSH key exchange offered");
        return { target, mode, ssh, positives, findings: classifySsh(target, ssh) };
    }
    if (mode === "smtp" || mode === "imap" || mode === "pop3" || mode === "postgres") {
        // Upgrade to TLS via the protocol's own mechanism (STARTTLS / STLS / SSLRequest),
        // then the same negotiated inspection. No hybrid probe over an upgraded socket, so
        // classify with an "inconclusive" hybrid result rather than claim we tested a
        // hybrid group we never advertised.
        let tls;
        if (mode === "smtp")
            tls = await probeSmtpStartTls(target.host, target.port, opts);
        else if (mode === "imap")
            tls = await probeLineStartTls(target.host, target.port, IMAP_DIALOG, opts);
        else if (mode === "pop3")
            tls = await probeLineStartTls(target.host, target.port, POP3_DIALOG, opts);
        else
            tls = await probePostgresSsl(target.host, target.port, opts);
        const hybrid = { hybridSelected: false, error: `not probed (${mode})` };
        return { target, mode, tls, hybrid, positives, findings: classifyTls(target, tls, hybrid) };
    }
    const [tls, hybrid] = await Promise.all([
        probeTlsNegotiated(target.host, target.port, opts),
        probeHybridSupport(target.host, target.port, opts),
    ]);
    if (hybrid.hybridSelected)
        positives.push("PQC-hybrid TLS (X25519MLKEM768) selected");
    return { target, mode, tls, hybrid, positives, findings: classifyTls(target, tls, hybrid) };
}
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
/**
 * Authorize (throws {@link AttestationError} / {@link TargetError} on failure — no
 * network I/O happens before a successful authorization) then probe every target
 * sequentially with a minimum interval between connections.
 */
export async function runProbe(opts) {
    authorizeTargets(opts.targets, opts.attest); // gate — throws before any connection
    const reports = [];
    const interval = opts.minIntervalMs ?? 250;
    for (let i = 0; i < opts.targets.length; i++) {
        if (i > 0 && interval > 0)
            await delay(interval);
        const target = opts.targets[i];
        const mode = resolveMode(target, opts.mode);
        reports.push(await probeEndpoint(target, mode, { servername: opts.servername, timeoutMs: opts.timeoutMs }));
    }
    const findings = reports.flatMap((r) => r.findings);
    return { reports, findings, inventory: buildInventory(findings) };
}
//# sourceMappingURL=index.js.map