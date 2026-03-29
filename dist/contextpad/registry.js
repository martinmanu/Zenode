class ContextPadRegistry {
    constructor() {
        this.actions = [];
    }
    /**
     * Registers a new action for the context pad.
     */
    register(action) {
        const existing = this.actions.findIndex(a => a.id === action.id);
        if (existing !== -1) {
            this.actions[existing] = action;
        }
        else {
            this.actions.push(action);
        }
    }
    /**
     * Removes an action by id.
     */
    unregister(id) {
        this.actions = this.actions.filter(a => a.id !== id);
    }
    /**
     * Returns all actions that apply to the given target.
     */
    getActionsFor(target, engine) {
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
    clear() {
        this.actions = [];
    }
}

export { ContextPadRegistry };
//# sourceMappingURL=registry.js.map
