// src/core/history/undoManager.ts
import { Command } from "./command.js";

export class UndoManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private limit: number = 20; // Default limit for free tier

  constructor(limit: number = 20) {
    this.limit = limit;
  }

  public setLimit(limit: number) {
    this.limit = limit;
  }

  public push(command: Command) {
    this.undoStack.push(command);
    // Clear redo stack on new action
    this.redoStack = [];

    if (this.undoStack.length > this.limit) {
      this.undoStack.shift(); // Remove oldest
    }
  }

  public undo() {
    const command = this.undoStack.pop();
    if (command) {
      command.undo();
      this.redoStack.push(command);
    }
  }

  public redo() {
    const command = this.redoStack.pop();
    if (command) {
      command.execute();
      this.undoStack.push(command);
    }
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public clear() {
    this.undoStack = [];
    this.redoStack = [];
  }

  public getHistory() {
    return {
      undo: this.undoStack.length,
      redo: this.redoStack.length
    };
  }
}
