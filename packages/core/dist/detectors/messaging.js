import { eachMatch, findingFromRule, hasExtension, maskCommentLines } from "../detect-utils.js";
import { CWE_RISKY_PRIMITIVE, CWE_BROKEN_CRYPTO } from "../cwe.js";
const MQ_EXTENSIONS = [".properties", ".conf", ".cfg", ".ini"];
const MQ_RULES = [
    {
        // Match TLSv1 (=1.0) and TLSv1.1 but never TLSv1.2 / TLSv1.3: the negative
        // lookahead stops "TLSv1" from matching the "TLSv1" inside "TLSv1.3".
        re: /\bssl\.(?:enabled\.)?protocols?\s*=\s*[^\n]{0,80}?\bTLSv1(?:\.1)?(?![.\d])/gi,
        meta: {
            id: "mq-kafka-legacy-tls",
            title: "Kafka legacy TLS protocol",
            description: "Kafka ssl.protocol / ssl.enabled.protocols permits TLS 1.0 / 1.1",
            category: "tls",
            severity: "medium",
            confidence: "high",
            hndl: false,
            cwe: CWE_RISKY_PRIMITIVE,
            message: "Kafka broker permits legacy TLS 1.0/1.1, an obsolete protocol; require TLS 1.3 (the harvestable classical key exchange is reported separately by the cipher-suite rule).",
            remediation: "Require TLS 1.3 and track PQC-hybrid KEX (X25519MLKEM768).",
        },
    },
    {
        re: /\btls_version\s+tlsv1(?:\.1)?(?![.\d])/gi,
        meta: {
            id: "mq-mqtt-legacy-tls",
            title: "MQTT legacy TLS version",
            description: "Mosquitto/MQTT tls_version permits TLS 1.0 / 1.1",
            category: "tls",
            severity: "medium",
            confidence: "high",
            hndl: false,
            cwe: CWE_RISKY_PRIMITIVE,
            message: "MQTT broker permits legacy TLS 1.0/1.1, an obsolete protocol; require TLS 1.3 (the harvestable classical key exchange is reported separately).",
            remediation: "Require TLS 1.3 and track PQC-hybrid KEX for device fleets.",
        },
    },
    {
        // Only static-RSA key transport (`TLS_RSA_WITH_…`) is flagged here: the ECDHE /
        // DHE suites are owned by source.ts's language-agnostic `tls-classical-kex` token
        // rule (which fires on `.properties` too), so flagging them here would double-count.
        re: /\bssl\.cipher\.suites\s*=\s*[^\n]{0,200}?\bTLS_RSA_WITH_/g,
        meta: {
            id: "mq-rsa-key-transport",
            title: "Broker static-RSA key transport cipher",
            description: "Kafka ssl.cipher.suites names a static-RSA (TLS_RSA_WITH_*) key-transport suite",
            category: "kem",
            algorithm: "RSA",
            severity: "medium",
            confidence: "high",
            hndl: true,
            cwe: CWE_BROKEN_CRYPTO,
            message: "Broker TLS is pinned to a static-RSA (TLS_RSA_WITH_*) key-transport suite; the wrapped session key is harvest-now-decrypt-later exposed (and it has no forward secrecy).",
            remediation: "Move to TLS 1.3 with a PQC-hybrid group (X25519MLKEM768) once the broker/runtime supports it.",
        },
    },
];
/** Detects classical transport crypto in message-broker / event-stream config. */
export const messagingDetector = {
    id: "messaging-transport",
    description: "Classical transport crypto in message brokers (Kafka, MQTT, RabbitMQ, NATS)",
    scope: "config",
    language: "any",
    rules: MQ_RULES.map((r) => r.meta),
    appliesTo: (f) => hasExtension(f, MQ_EXTENSIONS),
    detect({ file, content }) {
        const findings = [];
        // Broker config files ship large commented-out example blocks; a commented
        // directive is not active. Match over comment-masked content (offsets preserved,
        // so the snippet from the original `content` is still correct).
        const scan = maskCommentLines(content, ["#", "!", ";"]);
        for (const rule of MQ_RULES) {
            eachMatch(rule.re, scan, (m) => {
                findings.push(findingFromRule(rule.meta, { file, content, index: m.index, matchLength: m[0].length }));
            });
        }
        return findings;
    },
};
//# sourceMappingURL=messaging.js.map