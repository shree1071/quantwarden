import { buildContext } from "./redact.js";
/** The system rubric for a fix proposal. */
export const REMEDIATE_RUBRIC = "You are a post-quantum cryptography migration engineer. Given the FULL content " +
    "of one source file plus a finding describing classical (quantum-vulnerable) " +
    "cryptography in it, return the FULL corrected file content that removes the " +
    "flagged usage, migrating to a post-quantum or hybrid construction " +
    "(ML-KEM-768 / ML-DSA-65, hybrid X25519MLKEM768) where a safe replacement " +
    "exists. Change as little as possible; preserve all other code and formatting " +
    "exactly. If you cannot safely fix it, return newContent identical to the " +
    "input. NEVER invent or alter secrets/keys. After proposing, VERIFY with the " +
    "verify_fix tool and keep only fixes that clear the finding.";
/** JSON Schema every fix proposal must satisfy. */
export const FIX_REQUEST_SCHEMA = {
    type: "object",
    required: ["path", "newContent", "explanation"],
    properties: {
        path: { type: "string" },
        newContent: { type: "string" },
        explanation: { type: "string" },
    },
};
/** Build a remediation request bundle (offline; metadata level unless `readContent`). */
export function buildRemediateRequest(findings, level = "metadata", readContent) {
    const effectiveLevel = readContent ? level : "metadata";
    const contexts = findings.map((f) => buildContext(f, effectiveLevel, readContent ? readContent(f) : ""));
    return { instructions: REMEDIATE_RUBRIC, schema: FIX_REQUEST_SCHEMA, contexts };
}
//# sourceMappingURL=remediate-request.js.map