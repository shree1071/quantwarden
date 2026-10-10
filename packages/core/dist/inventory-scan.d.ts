import type { InventoryAsset } from "./types.js";
/**
 * Scan one file for cryptography worth recording.
 *
 * Longest-match-wins within a family is handled by pattern ORDER: `AES-256`
 * precedes `AES-128`, and `SHA-3` precedes `SHA-2`, so `SHA-384` is not also
 * counted as `SHA-3`. Each match position is claimed once.
 */
export declare function inventoryFile(file: string, content: string): InventoryAsset[];
/** Merge per-file assets into one list, summing counts and keeping example sites. */
export declare function mergeAssets(all: readonly InventoryAsset[][]): InventoryAsset[];
//# sourceMappingURL=inventory-scan.d.ts.map