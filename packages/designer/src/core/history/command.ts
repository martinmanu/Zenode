// src/core/history/command.ts
import { ZenodeEngine } from "../engine.js";

/**
 * Base interface for all undoable actions in the Zenode engine.
 */
export interface Command {
  execute(): void;
  undo(): void;
  commands?: Command[]; // Optional sub-commands for BatchCommand
  metadata?: {
    id: string;
    label: string;
    timestamp: number;
  };
}

/**
 * Concrete command for adding a node.
 */
export class AddNodeCommand implements Command {
  constructor(private engine: any, private nodeConfig: any) {}
  execute() {
    this.engine.addNode(this.nodeConfig, false); // false = don't record to history
  }
  undo() {
    this.engine.removeNode(this.nodeConfig.id, false); // false = don't record to history
  }
}

/**
 * Concrete command for removing a node.
 */
export class RemoveNodeCommand implements Command {
  private deletedNode: any;
  private deletedEdges: any[] = [];

  constructor(private engine: any, private nodeId: string) {
    this.deletedNode = engine.getNode(nodeId);
    this.deletedEdges = engine.getAllEdges().filter((e: any) => 
      e.sourceNodeId === nodeId || e.targetNodeId === nodeId
    );
  }

  execute() {
    this.engine.removeNode(this.nodeId, false);
  }

  undo() {
    if (this.deletedNode) {
      this.engine.addNode(this.deletedNode, false);
      this.deletedEdges.forEach(edge => {
        this.engine.addEdge(edge, false);
      });
    }
  }
}


/**
 * Concrete command for adding an edge.
 */
export class AddEdgeCommand implements Command {
    constructor(private engine: any, private edgeConfig: any) {}

    execute() {
        this.engine.addEdge(this.edgeConfig, false);
    }

    undo() {
        this.engine.removeEdge(this.edgeConfig.id, false);
    }
}

/**
 * Concrete command for removing an edge.
 */
export class RemoveEdgeCommand implements Command {
    constructor(private engine: any, private edge: any) {}

    execute() {
        this.engine.removeEdge(this.edge.id, false);
    }

    undo() {
        this.engine.addEdge(this.edge, false);
    }
}

/**
 * Concrete command for updating any node properties (position, rotation, dimensions, content).
 */
export class UpdateNodeCommand implements Command {
    constructor(
        private engine: any,
        private nodeId: string,
        private oldState: any, // Store full state for perfect undo
        private newState: any  // Store new state or patch for redo
    ) {}

    execute() {
        this.engine.updateNode(this.nodeId, this.newState, false);
    }

    undo() {
        this.engine.updateNode(this.nodeId, this.oldState, false);
    }
}

/**
 * Concrete command for updating the global engine configuration.
 */
export class UpdateConfigCommand implements Command {
    constructor(
        private engine: any,
        private oldConfig: any,
        private newConfig: any
    ) {}

    execute() {
        this.engine.updateConfig(this.newConfig, false);
    }

    undo() {
        this.engine.updateConfig(this.oldConfig, false);
    }
}

/**
 * Concrete command for adding a visual group.
 */
export class AddVisualGroupCommand implements Command {
    constructor(private engine: any, private group: any) {}
    execute() {
        this.engine.restoreVisualGroup?.(this.group);
    }
    undo() {
        this.engine.removeVisualGroup?.(this.group.id);
    }
}

/**
 * Concrete command for removing a visual group.
 */
export class RemoveVisualGroupCommand implements Command {
    constructor(private engine: any, private group: any) {}
    execute() {
        this.engine.removeVisualGroup?.(this.group.id);
    }
    undo() {
        this.engine.restoreVisualGroup?.(this.group);
    }
}

/**
 * Concrete command for batching multiple operations into one undo step.
 */
export class BatchCommand implements Command {
    constructor(public commands: Command[]) {}
    
    execute() {
        this.commands.forEach(cmd => cmd.execute());
    }
    
    undo() {
        // Undo in reverse order to maintain state integrity
        this.commands.slice().reverse().forEach(cmd => cmd.undo());
    }
}
/**
 * Concrete command for reordering nodes (Z-index).
 */
export class ReorderNodesCommand implements Command {
  constructor(
    private engine: any,
    private oldOrder: string[],
    private newOrder: string[]
  ) {}

  execute() {
    this.engine.setNodeOrder(this.newOrder, false);
  }

  undo() {
    this.engine.setNodeOrder(this.oldOrder, false);
  }
}
