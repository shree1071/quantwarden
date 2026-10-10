/**
 * Shared helpers for the regex-based source detectors: turning a string offset
 * into a 1-based line/column, extracting a trimmed single-line snippet, and a
 * small factory for building Finding objects with consistent remediation text.
 */
import type { AlgorithmFamily, Confidence, Finding, FindingCategory, RuleMeta, Severity } from "./types.js";
/** Inputs for {@link makeFinding}. */
interface FindingSpec {
    ruleId: string;
    title: string;
    category: FindingCategory;
    severity: Severity;
    confidence: Confidence;
    algorithm?: AlgorithmFamily;
    hndl: boolean;
    message: string;
    /** Override the auto-derived remediation text. */
    remediation?: string;
    /** Associated CWE id (e.g. "CWE-327"). */
    cwe?: string;
    /** Marks the matched snippet as the sensitive value itself (key material). */
    sensitive?: boolean;
    /** The matched source text and its start offset within `content`. */
    file: string;
    content: string;
    index: number;
    /** Length of the match, used to compute endLine for multi-line matches. */
    matchLength?: number;
}
/**
 * Build a {@link Finding} with location info derived from a match offset. When
 * no explicit remediation is given but an algorithm is, the canonical
 * remediation text for that family is used.
 */
export declare function makeFinding(spec: FindingSpec): Finding;
/** Where a match occurred, plus optional per-finding field overrides. */
interface RuleMatch {
    file: string;
    content: string;
    /** Match start offset within `content`. */
    index: number;
    /** Length of the match (used to compute endLine for multi-line matches). */
    matchLength?: number;
}
/**
 * Fields of a {@link RuleMeta} a detector may refine at match time. Multi-variant
 * rules (e.g. key generation across algorithm families) override these; fixed
 * rules pass none and inherit the catalog metadata verbatim.
 */
type RuleOverrides = Partial<Pick<RuleMeta, "title" | "category" | "severity" | "confidence" | "algorithm" | "hndl" | "message" | "cwe">> & {
    remediation?: string;
};
/**
 * Build a {@link Finding} from a rule's catalog metadata plus a match location,
 * applying any per-finding overrides. This is the single construction path for
 * detector findings: the invariant fields (title/severity/category/…) live once
 * in the {@link RuleMeta} declaration, so they can't drift from what the SARIF
 * catalog and the MCP resolver report.
 */
export declare function findingFromRule(rule: RuleMeta, at: RuleMatch, overrides?: RuleOverrides): Finding;
/** True if `filePath` has one of the given (lower-case, dotted) extensions. */
export declare function hasExtension(filePath: string, exts: readonly string[]): boolean;
/**
 * JavaScript / TypeScript source extensions handled by the source detectors.
 * `.vue` / `.svelte` single-file components embed a `<script>` block, so the
 * lexical detectors catch crypto usage inside them.
 */
export declare const JS_TS_EXTENSIONS: readonly string[];
/** Python source extensions handled by the Python detector. */
export declare const PYTHON_EXTENSIONS: readonly string[];
/** Go source extensions handled by the Go detector. */
export declare const GO_EXTENSIONS: readonly string[];
/** Java / Kotlin source extensions handled by the JCA detector. */
export declare const JAVA_EXTENSIONS: readonly string[];
/** C# source extensions handled by the .NET detector. */
export declare const CSHARP_EXTENSIONS: readonly string[];
/** Rust source extensions handled by the Rust detector. */
export declare const RUST_EXTENSIONS: readonly string[];
/** Ruby source extensions handled by the Ruby detector. */
export declare const RUBY_EXTENSIONS: readonly string[];
/** Elixir source extensions handled by the Elixir detector. */
export declare const ELIXIR_EXTENSIONS: readonly string[];
/** PHP source extensions handled by the PHP detector. */
export declare const PHP_EXTENSIONS: readonly string[];
/** C / C++ source extensions handled by the OpenSSL detector. */
export declare const C_EXTENSIONS: readonly string[];
/** Swift source extensions handled by the CryptoKit / Security-framework detector. */
export declare const SWIFT_EXTENSIONS: readonly string[];
/** Objective-C implementation extensions (`.h` is owned by the C pack). */
export declare const OBJC_EXTENSIONS: readonly string[];
/** Dart / Flutter source extensions. */
export declare const DART_EXTENSIONS: readonly string[];
/** Smart-contract source extensions (Solidity/EVM, Move, Cairo/Starknet). */
export declare const SMART_CONTRACT_EXTENSIONS: readonly string[];
/**
 * Prose/documentation extensions. The language-agnostic *token* detectors (SSH
 * public keys, TLS cipher suites, certificate signature algorithms) must not run
 * on these: a changelog or README that mentions `ssh-rsa` or `ECDHE-RSA` in a
 * sentence is prose, not crypto config. (PEM/`-----BEGIN` material stays in scope
 * everywhere, so a key pasted into docs is still caught.)
 */
export declare const DOC_EXTENSIONS: readonly string[];
/**
 * File-literal surfaces where a JWT/JOSE algorithm string (`"RS256"`, `"ES256"`)
 * is the same evidence regardless of language. Used to un-gate the JWT detector
 * from JS-only. Covers the languages whose JWT libraries pass the alg as a quoted
 * token — JS/TS, Python, Go (`jwt.GetSigningMethod("RS256")`) and Ruby
 * (`JWT.encode(payload, key, 'RS256')`) — so the regex stays precise (`HS*` HMAC
 * tokens are excluded by `RE_JWT_ALG`). Java/C# pass the alg as an *identifier*
 * (`SignatureAlgorithm.RS256`), which needs its own pattern — a later pass.
 * YAML/JSON config carry unquoted tokens and higher FP risk, so they wait too.
 */
export declare const JWT_HOST_EXTENSIONS: readonly string[];
/**
 * Extensions the scanner can actually analyze for inline crypto usage today
 * (the language-specific source detectors). A scan that walked files but found
 * none of these has NOT meaningfully assessed the codebase — reporters surface
 * that ({@link CryptoInventory}/coverage), so a bare 100/100 can't masquerade as
 * "safe" on, say, a Go or Rust repo. PEM / SSH / dependency detectors run on any
 * file and are intentionally excluded here.
 */
export declare const ANALYZABLE_SOURCE_EXTENSIONS: readonly string[];
/**
 * Human label for the source languages the scanner can analyze for inline
 * crypto, shown in coverage output. Kept next to {@link
 * ANALYZABLE_SOURCE_EXTENSIONS} so a new language pack updates one place.
 */
export declare const ANALYZABLE_LANGUAGES_LABEL = "JS/TS, Python, Go, Java/Kotlin/Scala, C#, Rust, Ruby, PHP, Elixir, C/C++, Swift, Objective-C, Dart, Solidity/Move/Cairo";
/** True when a path is in a source language the scanner can analyze for crypto. */
export declare function isAnalyzableSource(filePath: string): boolean;
/**
 * Given a SORTED ascending array of call offsets, return true when `idx` is at or
 * after some call offset `c` with `idx - c < window`. Deliberately ONE-SIDED
 * (forward only): the WebCrypto algorithm name follows the `subtle.*(` call it
 * belongs to, and reaching backward would wrongly attribute an UNRELATED earlier
 * call's argument (e.g. a Node `generateKeyPairSync('rsa-pss', …)` sitting a few
 * lines above a subtle call) to the wrong API. Runs in O(log n) by binary-searching
 * the largest call offset ≤ `idx` and checking the gap.
 */
export declare function nearSortedCall(sortedCalls: readonly number[], idx: number, window: number): boolean;
/**
 * Run a global regex over `content`, invoking `onMatch` for each hit. Resets
 * lastIndex and guards against zero-width matches (which would loop forever).
 */
export declare function eachMatch(re: RegExp, content: string, onMatch: (match: RegExpExecArray) => void): void;
/**
 * Return the innermost `{ … }` object that contains `index`, as a substring — so a
 * per-match check (e.g. a JWK's own `use`/`alg`, or whether an `alg` sits inside a
 * JWK) analyses ONLY that object and can't be contaminated by a neighbouring object
 * in a packed array. The scan is STRING-AWARE (braces and quotes inside JSON string
 * values, honouring `\"`, are ignored), so a value like `"a}b{c"` can't mis-scope the
 * object. Bounded by `maxSpan` each way so a pathological input can't blow up; falls
 * back to a bounded ±window when no enclosing object is found in range.
 */
export declare function enclosingObject(content: string, index: number, maxSpan?: number): string;
/**
 * Blank out FULL-LINE comments so a commented-out directive isn't reported as an
 * active setting. A line counts as a comment when its first non-whitespace characters
 * match one of `markers` (e.g. `#`, `//`, `;`, `!`). Each such line's characters are
 * replaced with spaces of the SAME length (newlines preserved), so every byte offset
 * is unchanged — the finding line/column/snippet for the non-comment lines that remain
 * stay exactly correct. Inline trailing comments are intentionally left alone (the
 * directive before them is still active, so it should still be flagged).
 *
 * Config detectors run their rules over the masked content; matches can then only land
 * on live config, not on commented examples (mosquitto.conf, CI YAML, ipsec.conf, and
 * HCL all conventionally ship large blocks of commented-out directives).
 */
export declare function maskCommentLines(content: string, markers: readonly string[]): string;
/**
 * Blank out C-style block comments (the `slash-star … star-slash` form, multi-line
 * included), replacing every
 * character with a space and preserving newlines so byte offsets — and therefore
 * finding line/column — stay exact. Complements {@link maskCommentLines}, which only
 * masks whole single-line comments: an HCL/Bicep resource wrapped in a block comment
 * has its inner lines mid-block (they don't START with `/*`), so a line-only masker
 * leaves them live. Not string-aware — a literal `/*` inside a config string value is
 * rare and, for these token detectors, a tolerable over-mask.
 */
export declare function maskBlockComments(content: string): string;
export {};
//# sourceMappingURL=detect-utils.d.ts.map