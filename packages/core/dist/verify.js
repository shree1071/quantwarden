import { detectFile, detectors } from "./scan.js";
/**
 * Map a language name (or a bare extension) to a source extension whose
 * detectors we run. Returns null for languages the scanner does not analyze.
 */
export function languageToExtension(language) {
    const l = language.trim().toLowerCase().replace(/^\./, "");
    const map = {
        js: ".js",
        javascript: ".js",
        jsx: ".jsx",
        ts: ".ts",
        typescript: ".ts",
        tsx: ".tsx",
        mjs: ".mjs",
        cjs: ".cjs",
        py: ".py",
        python: ".py",
        go: ".go",
        golang: ".go",
        java: ".java",
        kotlin: ".kt",
        kt: ".kt",
        cs: ".cs",
        csharp: ".cs",
        "c#": ".cs",
        dotnet: ".cs",
        rs: ".rs",
        rust: ".rs",
        rb: ".rb",
        ruby: ".rb",
        c: ".c",
        "c++": ".cpp",
        cpp: ".cpp",
        cc: ".cc",
        h: ".h",
        hpp: ".hpp",
    };
    return map[l] ?? null;
}
/**
 * Run all detectors over `code`, selecting them by `filename` (extension) or
 * `language`. Pure: no I/O. When neither identifies an analyzable language,
 * `supported` is false and the empty findings list must not be read as "fixed".
 */
export function verifyFix(code, opts) {
    let name;
    if (opts.filename && opts.filename.trim()) {
        name = opts.filename.trim();
    }
    else if (opts.language && opts.language.trim()) {
        const ext = languageToExtension(opts.language);
        if (!ext)
            return { supported: false, findings: [] };
        name = `snippet${ext}`;
    }
    else {
        return { supported: false, findings: [] };
    }
    const dotExt = name.replace(/^.*(\.[^.]+)$/, "$1");
    const supported = languageToExtension(dotExt) !== null;
    const findings = detectFile(name, code, detectors, { source: true, config: true, deps: true });
    return { supported, findings };
}
//# sourceMappingURL=verify.js.map