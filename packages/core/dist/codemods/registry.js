import { configToggleCodemod } from "./config-toggle.js";
/** All registered codemods, in priority order. */
export const codemodRegistry = [configToggleCodemod];
/** The first codemod that applies to `finding`, or undefined. */
export function codemodFor(finding) {
    return codemodRegistry.find((c) => c.applies(finding));
}
//# sourceMappingURL=registry.js.map