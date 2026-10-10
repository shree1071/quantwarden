import { JWT_HOST_EXTENSIONS, DOC_EXTENSIONS, eachMatch, enclosingObject, findingFromRule, hasExtension, } from "../detect-utils.js";
import { CWE_BROKEN_CRYPTO } from "../cwe.js";
const JOSE_RULES = [
    {
        re: /"alg"\s*:\s*"RSA(?:-OAEP(?:-256)?|1_5)"/g,
        meta: {
            id: "jose-jwe-rsa",
            title: "JWE RSA key wrapping",
            description: 'JWE "alg" of RSA-OAEP / RSA-OAEP-256 / RSA1_5 (RFC 7518)',
            category: "kem",
            severity: "high",
            confidence: "high",
            algorithm: "RSA",
            hndl: true,
            cwe: CWE_BROKEN_CRYPTO,
            message: "JWE wraps the content-encryption key with classical RSA (RSA-OAEP/RSA1_5); the encrypted payload is harvest-now-decrypt-later exposed.",
            remediation: "Plan migration to a post-quantum KEM (ML-KEM-768) for key wrapping as JOSE/COSE PQ algorithms are standardised.",
        },
    },
    {
        re: /"alg"\s*:\s*"ECDH-ES(?:\+A\d{3}KW)?"/g,
        meta: {
            id: "jose-jwe-ecdh",
            title: "JWE ECDH-ES key agreement",
            description: 'JWE "alg" of ECDH-ES / ECDH-ES+A*KW (RFC 7518)',
            category: "key-exchange",
            severity: "high",
            confidence: "high",
            algorithm: "ECDH",
            hndl: true,
            cwe: CWE_BROKEN_CRYPTO,
            message: "JWE derives the content-encryption key via classical ECDH-ES; the encrypted payload is harvest-now-decrypt-later exposed.",
            remediation: "Plan migration to hybrid post-quantum key agreement (X25519MLKEM768) as JOSE PQ algorithms are standardised.",
        },
    },
];
/** Detects classical JWE key-management (`alg`) values in JOSE tokens/config. */
export const joseDetector = {
    id: "jose-jwe-keymgmt",
    description: "Classical JWE key-management algorithms (RSA-OAEP, ECDH-ES) — confidentiality, HNDL",
    scope: "config",
    language: "any",
    rules: JOSE_RULES.map((r) => r.meta),
    // Prose examples (a README showing `"alg":"RSA-OAEP"`) are not JOSE config. In the
    // JS/TS/Python/Go/Ruby source files that source.ts's `jose-rsa-oaep`/`jose-ecdh-es`
    // token rules actually cover (JWT_HOST_EXTENSIONS), defer to them to avoid a
    // double-count — but STILL run on other source languages (Java/C#/Rust/PHP/Elixir/
    // C/C++), which source.ts does not cover for these tokens.
    appliesTo: (f) => !hasExtension(f, DOC_EXTENSIONS) && !hasExtension(f, JWT_HOST_EXTENSIONS),
    detect({ file, content }) {
        // Fast reject: no JOSE key-management alg token present.
        if (!content.includes("RSA-OAEP") &&
            !content.includes("RSA1_5") &&
            !content.includes("ECDH-ES")) {
            return [];
        }
        const findings = [];
        for (const rule of JOSE_RULES) {
            eachMatch(rule.re, content, (m) => {
                // If this `alg` belongs to a JWK (a `"kty"` sits in the SAME object), the jwk
                // detector already reports the key — defer so it isn't counted twice. Scoped
                // to the enclosing object so an unrelated nearby JWK doesn't suppress a real
                // standalone JWE header.
                if (enclosingObject(content, m.index).includes('"kty"'))
                    return;
                findings.push(findingFromRule(rule.meta, { file, content, index: m.index, matchLength: m[0].length }));
            });
        }
        return findings;
    },
};
//# sourceMappingURL=jose.js.map