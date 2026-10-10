import { DOC_EXTENSIONS, eachMatch, findingFromRule, hasExtension, maskBlockComments, maskCommentLines, } from "../detect-utils.js";
import { CWE_BROKEN_CRYPTO } from "../cwe.js";
// --- Envoy: match ONLY the Envoy-DISTINCTIVE tokens (`common_tls_context:`, the
// `*TlsContext` type names, `tls_certificates:`, the `envoy.transport_sockets.tls`
// transport socket). The generic `certificate_chain:` / `private_key:` fields are
// deliberately NOT matched here — they appear in unrelated YAML and would
// cross-label a non-Envoy file as Envoy (audit L2). A distinctive token IS the
// evidence, so no separate marker gate is needed for this rule (audit L1).
const RE_ENVOY_TLS = /\b(?:DownstreamTlsContext|UpstreamTlsContext|common_tls_context\s*:|tls_certificates\s*:|envoy\.transport_sockets\.tls)/g;
// --- Nginx: the classic `ssl_certificate` / `ssl_certificate_key` directive
// pair. `ssl_certificate_key` is matched first-class; `ssl_certificate` requires
// a following space so it doesn't also swallow `ssl_certificate_key` as a second
// hit on the same directive (kept as a single rule regardless).
const RE_NGINX_TLS = /\bssl_certificate(?:_key)?\s+\S/g;
// --- HAProxy: a `bind` line that terminates TLS (`ssl crt <path>`) or a
// `crt-store` section (HAProxy 2.8+ certificate store). `ssl` and `crt` may be
// separated by other bind args, so match them independently on a bind context.
const RE_HAPROXY_TLS = /\bcrt-store\b|\bbind\b[^\n]*\bssl\b[^\n]*\bcrt\b|\bbind\b[^\n]*\bcrt\b[^\n]*\bssl\b/g;
// --- Traefik: dynamic-config TLS certificate entries (`certFile:` + `keyFile:`)
// or an ACME `certResolver` reference. `certFile`/`keyFile` are Traefik-specific
// enough (paired with the `certResolver`/`tls:` marker gate) to anchor on.
const RE_TRAEFIK_TLS = /\bcertResolver\b|\b(?:certFile|keyFile)\s*:/g;
// --- gRPC in-code TLS channel credentials across languages.
const RE_GRPC_TLS = /grpc\.ssl_channel_credentials\s*\(|grpc\.credentials\.createSsl\s*\(|\bTlsChannelCredentials\b|\bcredentials\.NewTLS\s*\(/g;
const MESSAGE = (proxy) => `${proxy} terminates TLS with a classical certificate + ECDHE key exchange; the recorded handshake is harvest-now-decrypt-later exposed — verify the cert key algorithm and plan a PQC-hybrid (X25519MLKEM768) TLS migration.`;
const REMEDIATION = "Enable hybrid PQC key exchange (X25519MLKEM768) once the proxy/gRPC stack supports it; re-key certificates to PQC signatures (ML-DSA) when available.";
const RULE_ENVOY = {
    id: "proxy-envoy-tls",
    title: "Envoy classical TLS termination",
    description: "Envoy TLS context terminates TLS with a classical certificate + ECDHE key exchange",
    category: "key-exchange",
    severity: "medium",
    confidence: "medium",
    algorithm: "unknown",
    hndl: true,
    cwe: CWE_BROKEN_CRYPTO,
    message: MESSAGE("Envoy"),
    remediation: REMEDIATION,
};
const RULE_NGINX = {
    id: "proxy-nginx-tls",
    title: "Nginx classical TLS termination",
    description: "Nginx ssl_certificate/ssl_certificate_key terminates TLS with a classical cert + ECDHE",
    category: "key-exchange",
    severity: "medium",
    confidence: "medium",
    algorithm: "unknown",
    hndl: true,
    cwe: CWE_BROKEN_CRYPTO,
    message: MESSAGE("Nginx"),
    remediation: REMEDIATION,
};
const RULE_HAPROXY = {
    id: "proxy-haproxy-tls",
    title: "HAProxy classical TLS termination",
    description: "HAProxy bind ssl crt / crt-store terminates TLS with a classical cert + ECDHE",
    category: "key-exchange",
    severity: "medium",
    confidence: "medium",
    algorithm: "unknown",
    hndl: true,
    cwe: CWE_BROKEN_CRYPTO,
    message: MESSAGE("HAProxy"),
    remediation: REMEDIATION,
};
const RULE_TRAEFIK = {
    id: "proxy-traefik-tls",
    title: "Traefik classical TLS termination",
    description: "Traefik tls certificates (certFile/keyFile) or certResolver terminate TLS with a classical cert + ECDHE",
    category: "key-exchange",
    severity: "medium",
    confidence: "medium",
    algorithm: "unknown",
    hndl: true,
    cwe: CWE_BROKEN_CRYPTO,
    message: MESSAGE("Traefik"),
    remediation: REMEDIATION,
};
const RULE_GRPC = {
    id: "grpc-tls-credentials",
    title: "gRPC classical TLS channel credentials",
    description: "gRPC channel established with classical TLS credentials (RSA/ECDSA cert + ECDHE)",
    category: "key-exchange",
    severity: "medium",
    confidence: "medium",
    algorithm: "unknown",
    hndl: true,
    cwe: CWE_BROKEN_CRYPTO,
    message: MESSAGE("gRPC"),
    remediation: REMEDIATION,
};
/**
 * PERF fast-reject only — a superset of substrings that appear in every rule's
 * matchable input, so it can never drop a file a rule would flag. Correctness is
 * in the per-rule regexes (each is distinctive enough to self-gate); this list
 * exists purely to skip the regex work on files with no proxy/gRPC token at all.
 */
const PROXY_FAST_REJECT = [
    // Envoy
    "tls_context",
    "TlsContext",
    "tls_certificates",
    "transport_sockets.tls",
    // Nginx
    "ssl_certificate",
    // HAProxy (`crt-store` and `bind … ssl … crt` both contain "crt")
    "crt",
    // Traefik
    "certResolver",
    "certFile",
    "keyFile",
    // gRPC
    "ssl_channel_credentials",
    "createSsl",
    "TlsChannelCredentials",
    "credentials.NewTLS",
];
const PROXY_RULES = [
    { meta: RULE_ENVOY, re: RE_ENVOY_TLS },
    { meta: RULE_NGINX, re: RE_NGINX_TLS },
    { meta: RULE_HAPROXY, re: RE_HAPROXY_TLS },
    { meta: RULE_TRAEFIK, re: RE_TRAEFIK_TLS },
    { meta: RULE_GRPC, re: RE_GRPC_TLS },
];
/**
 * Detects classical-cert TLS termination in standalone reverse-proxy /
 * load-balancer config files and in-code gRPC channel credentials. See the
 * module docstring for the covered surfaces and the fast-reject rationale.
 */
export const proxyDetector = {
    id: "proxy-tls-crypto",
    description: "Classical-cert TLS termination in reverse-proxy / load-balancer config (Envoy, Nginx, HAProxy, Traefik) and gRPC channel credentials",
    scope: "config",
    language: "any",
    rules: PROXY_RULES.map((r) => r.meta),
    // Config + source files are all in scope (gRPC creds live in code); only prose
    // documentation is excluded, so a README mentioning `ssl_certificate` in a
    // sentence can't fire (the marker gate already handles most of this).
    appliesTo: (f) => !hasExtension(f, DOC_EXTENSIONS),
    detect({ file, content }) {
        // Mask comments first so a directive that only appears inside a commented-out
        // block cannot fire.
        const scan = maskCommentLines(maskBlockComments(content), ["#", "//"]);
        // Cheap fast-reject: skip files with none of the distinctive tokens. This is a
        // perf gate only — each rule's regex is distinctive enough to SELF-GATE (a
        // separate too-narrow marker list previously dropped canonical HAProxy/Traefik
        // configs entirely — audit H1/H2), so correctness lives in the per-rule regexes.
        if (!PROXY_FAST_REJECT.some((mk) => scan.includes(mk)))
            return [];
        const findings = [];
        for (const { meta, re } of PROXY_RULES) {
            eachMatch(re, scan, (m) => findings.push(findingFromRule(meta, { file, content, index: m.index, matchLength: m[0].length })));
        }
        return findings;
    },
};
//# sourceMappingURL=proxy.js.map