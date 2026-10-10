export const configToggleCodemod = {
    id: "config-toggle",
    applies(finding) {
        return finding.ruleId === "tls-legacy-version" || finding.ruleId === "tls-reject-unauthorized";
    },
    apply(content, finding) {
        // Normalize ALL insecure TLS config in one pass (not just this finding's
        // aspect), so a file with both issues is fully fixed by a single patch — the
        // pipeline dedupes patches by file, and a partial patch would drop a sibling.
        const out = content
            .replace(/((?:minVersion|maxVersion)\s*:\s*['"`])TLSv1(?:\.1)?(['"`])/g, "$1TLSv1.3$2")
            .replace(/(secureProtocol\s*:\s*['"`])TLSv1(?:_1)?_method(['"`])/g, "$1TLSv1_3_method$2")
            .replace(/(rejectUnauthorized\s*:\s*)false/g, "$1true");
        if (out === content)
            return null;
        return {
            path: finding.location.file,
            newContent: out,
            ruleId: finding.ruleId,
            source: "codemod",
        };
    },
};
//# sourceMappingURL=config-toggle.js.map