import { ContextPadAction, ContextPadTarget } from "../types/index.js";
export declare class ContextPadRegistry {
    private actions;
    constructor();
    /**
     * Registers a new action for the context pad.
     */
    register(action: ContextPadAction): void;
    /**
     * Removes an action by id.
     */
    unregister(id: string): void;
    /**
     * Returns all actions that apply to the given target.
     */
    getActionsFor(target: ContextPadTarget, engine: any): ContextPadAction[];
    /**
     * Resets the registry to a clean state.
     */
    clear(): void;
}
