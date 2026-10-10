import { DOC_EXTENSIONS, eachMatch, enclosingObject, findingFromRule, hasExtension, } from "../detect-utils.js";
import { isCloudTemplateFile } from "./cloudformation.js";
import { CWE_BROKEN_CRYPTO } from "../cwe.js";
const JWK_RULES = [
    {
        re: /"kty"\s*:\s*"RSA"/g,
        meta: {
            id: "jwk-rsa",
            title: "RSA JSON Web Key (JWK)",
            description: 'JWK with "kty":"RSA" (RFC 7518)',
            category: "certificate",
            severity: "medium",
            confidence: "high",
            algorithm: "RSA",
            hndl: true,
            cwe: CWE_BROKEN_CRYPTO,
            message: "RSA JSON Web Key (JWK); classical RSA, not quantum-safe.",
            remediation: "Re-issue with PQC keys (ML-KEM-768 for encryption, ML-DSA-65 for signatures).",
        },
    },
    {
        re: /"crv"\s*:\s*"(?:P-256K?|P-384|P-521|secp256k1)"/g,
        meta: {
            id: "jwk-ec",
            title: "EC JSON Web Key (JWK)",
            description: 'JWK with an "crv" naming a NIST/secp curve (RFC 7518)',
            category: "key-exchange",
            severity: "medium",
            confidence: "high",
            algorithm: "ECDH",
            hndl: true,
            cwe: CWE_BROKEN_CRYPTO,
            message: "Elliptic-curve JSON Web Key (JWK); a classical EC key feeds BOTH ECDSA signatures and ECDH key agreement — the ECDH path is harvest-now-decrypt-later exposed.",
            remediation: "For key agreement: hybrid X25519MLKEM768 (ML-KEM-768). For signatures: ML-DSA-65 (FIPS 204).",
        },
    },
    {
        re: /"crv"\s*:\s*"Ed(?:25519|448)"/g,
        meta: {
            id: "jwk-eddsa",
            title: "EdDSA JSON Web Key (JWK)",
            description: 'JWK OKP key with "crv":"Ed25519"/"Ed448" (RFC 8037)',
            category: "signature",
            severity: "low",
            confidence: "high",
            algorithm: "EdDSA",
            hndl: false,
            cwe: CWE_BROKEN_CRYPTO,
            message: "EdDSA (Ed25519/Ed448) JSON Web Key (JWK); classical and forgeable by a quantum attacker.",
            remediation: "ML-DSA-65 (FIPS 204) or SLH-DSA (FIPS 205).",
        },
    },
    {
        re: /"crv"\s*:\s*"X(?:25519|448)"/g,
        meta: {
            id: "jwk-xdh",
            title: "X25519/X448 JSON Web Key (JWK)",
            description: 'JWK OKP key with "crv":"X25519"/"X448" (RFC 8037)',
            category: "key-exchange",
            severity: "medium",
            confidence: "high",
            algorithm: "X25519",
            hndl: true,
            cwe: CWE_BROKEN_CRYPTO,
            message: "X25519/X448 JSON Web Key (JWK); modern but classical key agreement, and harvest-now-decrypt-later exposed.",
            remediation: "Migrate key agreement to hybrid X25519MLKEM768 (ML-KEM-768).",
        },
    },
];
/**
 * True when THIS key's own object marks it as a signing key via `use`/`alg`. The
 * caller passes the enclosing `{…}` object so a neighbouring key in a JWKS array
 * can't contaminate the result, and an explicit `"use":"enc"` on the key always
 * wins (never classify an encryption key as a signature).
 */
function isSigningUse(objectText, sigAlg) {
    if (/"use"\s*:\s*"enc"/.test(objectText))
        return false;
    return /"use"\s*:\s*"sig"/.test(objectText) || sigAlg.test(objectText);
}
const RSA_SIG_ALG = /"alg"\s*:\s*"(?:RS|PS)(?:256|384|512)"/;
const EC_SIG_ALG = /"alg"\s*:\s*"ES(?:256K?|384|512)"/;
/** Detects classical JSON Web Key (JWK/JWKS) material in any JSON/text file. */
export const jwkDetector = {
    id: "jwk-material",
    description: "Classical key material in JSON Web Keys (JWK / JWKS)",
    scope: "config",
    language: "any",
    rules: JWK_RULES.map((r) => r.meta),
    appliesTo: (f) => !hasExtension(f, DOC_EXTENSIONS),
    detect({ file, content }) {
        // Fast reject: a JWK always has one of these two members.
        if (!content.includes('"kty"') && !content.includes('"crv"'))
            return [];
        // The ONLY overlap with the cloudformation detector is the ARM Key Vault key
        // `kty:"RSA"` (cfn-arm-keyvault-rsa), which only fires when Microsoft.KeyVault is
        // present. Defer just the RSA rule in that case — everything else (crv keys, and
        // JWKs embedded in AWS CloudFormation, which cfn does not own) is still reported.
        const isArm = isCloudTemplateFile(file, content) && content.includes("Microsoft.KeyVault");
        const findings = [];
        for (const rule of JWK_RULES) {
            eachMatch(rule.re, content, (m) => {
                if (rule.meta.id === "jwk-rsa" && isArm)
                    return; // cfn-arm-keyvault-rsa owns it
                const at = { file, content, index: m.index, matchLength: m[0].length };
                // Analyse the key's OWN enclosing object so a neighbouring key in a JWKS
                // array can't flip this key's sig/enc classification.
                const obj = enclosingObject(content, m.index);
                let overrides;
                if (rule.meta.id === "jwk-rsa" && isSigningUse(obj, RSA_SIG_ALG)) {
                    overrides = {
                        category: "signature",
                        hndl: false,
                        message: "RSA JSON Web Key (JWK) used for signing (RS*/PS*); forgeable by a quantum attacker.",
                    };
                }
                else if (rule.meta.id === "jwk-ec" && isSigningUse(obj, EC_SIG_ALG)) {
                    overrides = {
                        category: "signature",
                        algorithm: "ECDSA",
                        hndl: false,
                        message: "Elliptic-curve JSON Web Key (JWK) used for ECDSA signing; forgeable by a quantum attacker.",
                    };
                }
                findings.push(findingFromRule(rule.meta, at, overrides));
            });
        }
        return findings;
    },
};
//# sourceMappingURL=jwk.js.map