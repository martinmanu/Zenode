import { ContextPadAction, ContextPadTarget } from "../types/index.js";

export class ContextPadRegistry {
  private actions: ContextPadAction[] = [];

  constructor() {}

  /**
   * Registers a new action for the context pad.
   */
  register(action: ContextPadAction): void {
    const existing = this.actions.findIndex(a => a.id === action.id);
    if (existing !== -1) {
      this.actions[existing] = action;
    } else {
      this.actions.push(action);
    }
  }

  /**
   * Removes an action by id.
   */
  unregister(id: string): void {
    this.actions = this.actions.filter(a => a.id !== id);
  }

  /**
   * Returns all actions that apply to the given target.
   */
  getActionsFor(target: ContextPadTarget, engine: any): ContextPadAction[] {
    return this.actions.filter(action => {
      // Check target kind (node/edge)
      if (action.targets && !action.targets.includes(target.kind)) {
        return false;
      }

      // Check specific types (e.g. "rectangle")
      if (action.appliesTo && !action.appliesTo.includes(target.data.type)) {
        return false;
      }

      // Check dynamic visibility
      if (action.isVisible && !action.isVisible(target, engine)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Resets the registry to a clean state.
   */
  clear(): void {
    this.actions = [];
  }
}
