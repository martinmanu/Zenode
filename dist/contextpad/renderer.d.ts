import { ContextPadAction, ContextPadTarget } from "../types/index.js";
export declare class ContextPadRenderer {
    private container;
    private padElement;
    private currentTarget;
    private currentActions;
    constructor(container: HTMLElement);
    /**
     * Renders the context pad for a specific target.
     */
    render(target: ContextPadTarget, actions: ContextPadAction[], engine: any): void;
    /**
     * Applies configurable styles to the pad and buttons.
     */
    private applyStyles;
    /**
     * Renders the buttons inside the pad.
     */
    private renderButtons;
    /**
     * Updates only the states of the buttons without re-rendering the whole pad.
     */
    update(engine: any): void;
    /**
     * Updates the pad position based on the current zoom transform.
     */
    updatePosition(engine: any): void;
    /**
     * Hides and removes the context pad.
     */
    hide(engine?: any): void;
}
