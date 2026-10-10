/** How many example sites to keep per algorithm. Evidence, not a concordance. */
const MAX_LOCATIONS = 5;
/**
 * NIST PQC standards, by name and by the parameter sets people actually type.
 *
 * FIPS 203/204/205 names first, then the round-3 CRYSTALS names, kept separate
 * because they are NOT the same thing: a Kyber768 build is not an ML-KEM-768
 * build (FIPS 203 changed the KDF and domain separation). Reporting them as one
 * algorithm would let a pre-standard build claim standards compliance, which is
 * the exact confusion `pqc-parameter` exists to flag.
 */
const PQC = [
    {
        re: /\bML[-_]?KEM[-_]?(512|768|1024)\b/gi,
        algorithm: "ML-KEM",
        kind: "kem",
        posture: "quantum-safe",
    },
    {
        re: /\bML[-_]?DSA[-_]?(44|65|87)\b/gi,
        algorithm: "ML-DSA",
        kind: "signature",
        posture: "quantum-safe",
    },
    {
        re: /\bSLH[-_]?DSA[-_]?(?:SHA2|SHAKE)[-_]?\d+[fs]?\b/gi,
        algorithm: "SLH-DSA",
        kind: "signature",
        posture: "quantum-safe",
    },
    // Hybrids: the deployed shape of PQC key agreement today, and the thing a
    // reader most wants confirmed. Named separately from bare ML-KEM because the
    // classical half is the point.
    {
        re: /\bX25519(?:ML)?KEM768\b|\bX25519_?KYBER768\b|\bsecp256r1mlkem768\b/gi,
        algorithm: "X25519MLKEM768 (hybrid)",
        kind: "key-agreement",
        posture: "quantum-safe",
    },
    // Pre-standard CRYSTALS. Quantum-safe in the sense that matters here (not
    // broken by Shor) but NOT FIPS, so it is named for what it is.
    {
        re: /\bKyber(?:512|768|1024)\b|\bpqc_kyber\b|\bcrystals[-_]kyber\b/gi,
        algorithm: "Kyber (pre-standard)",
        kind: "kem",
        posture: "quantum-safe",
    },
    {
        re: /\bDilithium[2-5]\b|\bcrystals[-_]dilithium\b/gi,
        algorithm: "Dilithium (pre-standard)",
        kind: "signature",
        posture: "quantum-safe",
    },
    {
        re: /\bSPHINCS\+?[-_]/gi,
        algorithm: "SPHINCS+ (pre-standard)",
        kind: "signature",
        posture: "quantum-safe",
    },
    {
        re: /\bFALCON[-_]?(512|1024)\b/gi,
        algorithm: "FALCON",
        kind: "signature",
        posture: "quantum-safe",
    },
];
/**
 * Symmetric and hash primitives.
 *
 * Included because "what cryptography do we use" is the question, and an
 * inventory that omitted AES would be answering a narrower one. Classified
 * `not-quantum-relevant` rather than safe: Grover halves the effective strength
 * of a symmetric key, which is a real consideration at 128 bits and not a break
 * at 256, and calling it "quantum-safe" beside ML-KEM would flatten that.
 *
 * Legacy primitives (3DES, RC4, MD5, SHA-1) are recorded too. They are broken
 * classically, which is somebody else's rule to enforce, but leaving them out
 * of an inventory of what you use would be a strange omission.
 */
const SYMMETRIC = [
    {
        re: /\bAES[-_]?256\b|\bAES256\b/gi,
        algorithm: "AES-256",
        kind: "symmetric",
        posture: "not-quantum-relevant",
    },
    {
        re: /\bAES[-_]?192\b/gi,
        algorithm: "AES-192",
        kind: "symmetric",
        posture: "not-quantum-relevant",
    },
    {
        re: /\bAES[-_]?128\b|\bAES128\b/gi,
        algorithm: "AES-128",
        kind: "symmetric",
        posture: "not-quantum-relevant",
    },
    {
        re: /\bChaCha20\b/gi,
        algorithm: "ChaCha20",
        kind: "symmetric",
        posture: "not-quantum-relevant",
    },
    {
        re: /\b3DES\b|\bTripleDES\b|\bDES[-_]?EDE3\b/gi,
        algorithm: "3DES",
        kind: "symmetric",
        posture: "not-quantum-relevant",
    },
    { re: /\bRC4\b/gi, algorithm: "RC4", kind: "symmetric", posture: "not-quantum-relevant" },
    {
        re: /\bSHA[-_]?3[-_]?(224|256|384|512)\b/gi,
        algorithm: "SHA-3",
        kind: "hash",
        posture: "not-quantum-relevant",
    },
    {
        re: /\bSHA[-_]?(384|512)\b/gi,
        algorithm: "SHA-2 (384/512)",
        kind: "hash",
        posture: "not-quantum-relevant",
    },
    { re: /\bSHA[-_]?256\b/gi, algorithm: "SHA-256", kind: "hash", posture: "not-quantum-relevant" },
    {
        re: /\bSHA[-_]?1\b|\bsha1\b/gi,
        algorithm: "SHA-1",
        kind: "hash",
        posture: "not-quantum-relevant",
    },
    { re: /\bMD5\b/gi, algorithm: "MD5", kind: "hash", posture: "not-quantum-relevant" },
];
const PATTERNS = [...PQC, ...SYMMETRIC];
/**
 * Is this match a key rather than a use?
 *
 * `.cargo_vcs_info.json` carries `{"sha1": "…"}` for the git commit, and a
 * naive sweep read that as "this project uses SHA-1". It does not: the name is
 * the label on a field, and the algorithm never runs. An algorithm named in KEY
 * position is metadata; named in value or call position it is usage.
 *
 * Cheap and lexical, like the rest: look at what immediately follows. A closing
 * quote and a colon means the token was a key.
 *
 * A DOUBLE colon is Rust's path separator, not a key: `ml_kem_768::keypair()`
 * is the most usage-like thing in the file. The first version of this guard
 * dropped exactly that, and the test suite caught it.
 */
function isKeyPosition(content, end) {
    const after = content.slice(end, end + 3);
    return /^["']?\s*:(?!:)/.test(after);
}
/** 1-based line number of an offset. */
function lineOf(content, index) {
    let line = 1;
    for (let i = 0; i < index && i < content.length; i++)
        if (content[i] === "\n")
            line++;
    return line;
}
/**
 * Scan one file for cryptography worth recording.
 *
 * Longest-match-wins within a family is handled by pattern ORDER: `AES-256`
 * precedes `AES-128`, and `SHA-3` precedes `SHA-2`, so `SHA-384` is not also
 * counted as `SHA-3`. Each match position is claimed once.
 */
export function inventoryFile(file, content) {
    const byAlgorithm = new Map();
    const claimed = [];
    for (const p of PATTERNS) {
        p.re.lastIndex = 0;
        let m;
        while ((m = p.re.exec(content)) !== null) {
            const start = m.index;
            const end = start + m[0].length;
            // A position already attributed to a more specific pattern is not counted
            // twice: "SHA-384" is SHA-2, not also a bare SHA match.
            if (claimed.some(([s, e]) => start < e && end > s))
                continue;
            // A name in key position is a field label, not a use of the algorithm.
            if (isKeyPosition(content, end))
                continue;
            claimed.push([start, end]);
            const entry = byAlgorithm.get(p.algorithm) ?? {
                algorithm: p.algorithm,
                kind: p.kind,
                posture: p.posture,
                count: 0,
                locations: [],
            };
            entry.count += 1;
            if (entry.locations.length < MAX_LOCATIONS) {
                entry.locations.push({ file, line: lineOf(content, start), snippet: m[0] });
            }
            byAlgorithm.set(p.algorithm, entry);
        }
    }
    return [...byAlgorithm.values()];
}
/** Merge per-file assets into one list, summing counts and keeping example sites. */
export function mergeAssets(all) {
    const merged = new Map();
    for (const list of all) {
        for (const a of list) {
            const at = merged.get(a.algorithm);
            if (!at) {
                merged.set(a.algorithm, { ...a, locations: [...a.locations] });
                continue;
            }
            at.count += a.count;
            for (const loc of a.locations) {
                if (at.locations.length < MAX_LOCATIONS)
                    at.locations.push(loc);
            }
        }
    }
    // Quantum-vulnerable first, then safe, then the rest: the reader's order of
    // interest, and the same order the panel renders.
    const rank = { "quantum-vulnerable": 0, "quantum-safe": 1, "not-quantum-relevant": 2 };
    return [...merged.values()].sort((a, b) => rank[a.posture] - rank[b.posture] ||
        b.count - a.count ||
        a.algorithm.localeCompare(b.algorithm));
}
//# sourceMappingURL=inventory-scan.js.map