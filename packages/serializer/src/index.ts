import type { ZenodeDiagramState } from "@zenode/core";

/**
 * Serializes the pure Zenode diagram state to a JSON string.
 */
export function toJSON(state: ZenodeDiagramState): string {
    return JSON.stringify(state, null, 2);
}

/**
 * Parses a JSON string to restore a Zenode diagram state.
 */
export function fromJSON(json: string): ZenodeDiagramState {
    const state = JSON.parse(json);
    if (!state.version) {
        // Handle migration from legacy states if needed in the future
        state.version = "1.0";
    }
    return state as ZenodeDiagramState;
}
