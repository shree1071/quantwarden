import type { ScanResult } from "./types.js";
/** A single OpenVEX statement: one synthetic vulnerability over its affected products. */
export interface OpenVexStatement {
    vulnerability: {
        name: string;
        description?: string;
    };
    products: {
        "@id": string;
    }[];
    status: "not_affected" | "affected" | "fixed" | "under_investigation";
    /** Recommended action for an `affected` product (the rule's remediation). */
    action_statement?: string;
    /** Free-form status detail — carries the `--triage` exposure verdict when present. */
    status_notes?: string;
}
/** An OpenVEX 0.2.0 document. */
export interface OpenVexDocument {
    "@context": "https://openvex.dev/ns/v0.2.0";
    "@id": string;
    author: string;
    timestamp: string;
    version: number;
    statements: OpenVexStatement[];
}
/** Options for {@link toOpenVex}. */
export interface OpenVexOptions {
    /** Document author (VEX issuer). Default: `"qScan"`. */
    author?: string;
}
/**
 * Build an OpenVEX 0.2.0 document from a scan result. One statement per distinct
 * rule id, listing every affected `file:line` product. Output is deterministic
 * (statements sorted by vulnerability name, products sorted and de-duplicated;
 * the `@id` and `timestamp` derive from the result), so re-exporting the same
 * scan yields byte-identical VEX.
 */
export declare function toOpenVex(result: ScanResult, opts?: OpenVexOptions): OpenVexDocument;
//# sourceMappingURL=vex.d.ts.map