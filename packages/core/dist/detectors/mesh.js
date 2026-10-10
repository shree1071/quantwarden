import { eachMatch, findingFromRule, hasExtension, maskCommentLines } from "../detect-utils.js";
import { CWE_BROKEN_CRYPTO } from "../cwe.js";
// `.json` is included because Consul agent config is commonly JSON (the
// `private_key_type` rules already support the JSON `:` form); the content gates
// keep unrelated generic JSON/YAML out.
const MESH_EXTENSIONS = [".yaml", ".yml", ".hcl", ".json"];
// Linkerd's default self-managed identity scheme (`linkerd.io/tls`, as opposed
// to a `kubernetes.io/tls` bring-your-own-cert secret) mints its trust anchor
// and issuer credentials as ECDSA P-256 by default. Matched in both nested
// YAML form (`scheme: linkerd.io/tls`) and the flattened Helm `--set`/values
// key form (`identity.issuer.scheme: linkerd.io/tls`), plus the distinctive
// `identityTrustAnchorsPEM` values key which only exists in Linkerd charts.
const RE_MESH_LINKERD_ECDSA = /identityTrustAnchorsPEM\b|(?:identity\.issuer\.scheme|scheme)\s*[:=]\s*["']?linkerd\.io\/tls\b/g;
// Consul Connect's CA provider config: `private_key_type = "ec" | "rsa"`
// inside a `ca_config` block. Matched in both HCL (`=`) and JSON (`:`) forms,
// mirroring the terraform.ts attribute-matching convention.
const RE_MESH_CONSUL_RSA = /(?<![\w"-])"?private_key_type"?\s*[:=]\s*"rsa"/gi;
const RE_MESH_CONSUL_EC = /(?<![\w"-])"?private_key_type"?\s*[:=]\s*"ec"/gi;
const RULE_MESH_LINKERD_ECDSA = {
    id: "mesh-linkerd-identity-ecdsa",
    title: "Linkerd ECDSA identity issuer",
    description: "Linkerd control-plane identity issuer (default ECDSA P-256 mesh CA)",
    category: "certificate",
    severity: "medium",
    confidence: "high",
    algorithm: "ECDSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "Linkerd's control-plane identity issuer mints workload certificates from a classical ECDSA P-256 trust anchor by default, forgeable by a quantum attacker.",
    remediation: "Plan migration to ML-DSA-65 (FIPS 204) once Linkerd's identity issuer supports PQC signing.",
};
const RULE_MESH_CONSUL_RSA = {
    id: "mesh-consul-connect-rsa",
    title: "Consul Connect RSA mesh CA",
    description: 'Consul Connect ca_config private_key_type = "rsa"',
    category: "certificate",
    severity: "medium",
    confidence: "high",
    algorithm: "RSA",
    hndl: true,
    cwe: CWE_BROKEN_CRYPTO,
    message: "Consul Connect's mesh CA issues leaf certificates from a classical RSA private key, which is not quantum-safe.",
    remediation: "Plan migration to PQC certificate keys (ML-DSA-65) as the Connect CA provider adds support.",
};
const RULE_MESH_CONSUL_EC = {
    id: "mesh-consul-connect-ec",
    title: "Consul Connect EC mesh CA",
    description: 'Consul Connect ca_config private_key_type = "ec"',
    category: "certificate",
    severity: "medium",
    confidence: "high",
    algorithm: "ECDSA",
    hndl: false,
    cwe: CWE_BROKEN_CRYPTO,
    message: "Consul Connect's mesh CA issues leaf certificates from a classical EC private key, forgeable by a quantum attacker.",
    remediation: "Plan migration to ML-DSA-65 (FIPS 204) as the Connect CA provider adds support.",
};
/**
 * Detects classical asymmetric crypto in service-mesh configuration: Linkerd's
 * default ECDSA identity issuer and Consul Connect's mesh CA private key type.
 * (Istio ECDHE cipher-suite strings are covered by `source.ts`'s
 * `tls-classical-kex` token rule, so they are not duplicated here.)
 */
export const meshDetector = {
    id: "service-mesh-crypto",
    description: "Classical crypto in service-mesh config (Linkerd identity, Consul Connect CA)",
    scope: "config",
    language: "any",
    rules: [RULE_MESH_LINKERD_ECDSA, RULE_MESH_CONSUL_RSA, RULE_MESH_CONSUL_EC],
    appliesTo: (f) => hasExtension(f, MESH_EXTENSIONS),
    detect({ file, content }) {
        const isLinkerd = content.includes("linkerd") || content.includes("identityTrustAnchors");
        const isConsulConnect = content.includes("consul") && content.includes("connect");
        if (!isLinkerd && !isConsulConnect)
            return [];
        // Mask whole comment lines (YAML/HCL `#`, HCL/JSON5 `//`) so a commented-out
        // directive can't fire — `.yaml`/`.hcl`/`.json` are not centrally stripped.
        // Offsets are preserved, so the finding location stays exact.
        const scan = maskCommentLines(content, ["#", "//"]);
        const findings = [];
        const add = (re, rule) => eachMatch(re, scan, (m) => findings.push(findingFromRule(rule, { file, content, index: m.index, matchLength: m[0].length })));
        if (isLinkerd)
            add(RE_MESH_LINKERD_ECDSA, RULE_MESH_LINKERD_ECDSA);
        if (isConsulConnect) {
            add(RE_MESH_CONSUL_RSA, RULE_MESH_CONSUL_RSA);
            add(RE_MESH_CONSUL_EC, RULE_MESH_CONSUL_EC);
        }
        return findings;
    },
};
//# sourceMappingURL=mesh.js.map