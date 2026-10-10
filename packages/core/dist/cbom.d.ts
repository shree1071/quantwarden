import type { ScanResult } from "./types.js";
/** A CycloneDX 1.6 cryptographic bill of materials (kept permissive). */
export interface CycloneDxBom {
    bomFormat: "CycloneDX";
    specVersion: "1.6";
    serialNumber: string;
    version: number;
    metadata: Record<string, unknown>;
    components: CbomComponent[];
}
/** A single CycloneDX `cryptographic-asset` component. */
export interface CbomComponent {
    type: "cryptographic-asset";
    "bom-ref": string;
    name: string;
    cryptoProperties: Record<string, unknown>;
    /** CycloneDX component name/value properties (carries the quantum posture flags). */
    properties?: {
        name: string;
        value: string;
    }[];
    evidence?: Record<string, unknown>;
}
/**
 * Build a CycloneDX 1.6 CBOM from a scan result. One component per distinct
 * (algorithm + primitive) pair, with occurrence evidence (file:line) per
 * finding. Output is deterministic (components and occurrences are sorted).
 */
export declare function toCbom(result: ScanResult): CycloneDxBom;
//# sourceMappingURL=cbom.d.ts.map