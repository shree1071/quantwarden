import type { CycloneDxBom } from "./cbom.js";
/**
 * Merge CBOMs into one. Components with the same `bom-ref` (same algorithm +
 * primitive) are combined; their occurrence evidence is unioned and their
 * harvest-now-decrypt-later flag is OR-ed. Tool and root metadata from every input
 * is preserved.
 */
export declare function mergeCboms(boms: readonly CycloneDxBom[]): CycloneDxBom;
//# sourceMappingURL=cbom-merge.d.ts.map