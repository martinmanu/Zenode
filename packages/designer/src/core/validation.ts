import { NodeData, EdgeData } from "@zenode/core";

export interface ValidationRule {
    id: string;
    description: string;
    run: (nodes: NodeData[], edges: EdgeData[]) => ValidationError[];
}

export interface ValidationError {
    nodeId?: string;
    edgeId?: string;
    message: string;
    severity: 'error' | 'warning';
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

export const BuiltInRules: Record<string, ValidationRule> = {
    'no-orphans': {
        id: 'no-orphans',
        description: 'All nodes must be connected to at least one other node.',
        run: (nodes, edges) => {
            const connectedNodeIds = new Set();
            edges.forEach(e => {
                connectedNodeIds.add(e.sourceNodeId);
                connectedNodeIds.add(e.targetNodeId);
            });

            return nodes
                .filter(n => !connectedNodeIds.has(n.id))
                .map(n => ({
                    nodeId: n.id,
                    message: `Node "${n.content?.items.find(i=>i.kind==='text')?.value || n.id}" is an orphan.`,
                    severity: 'warning'
                }));
        }
    },
    'no-cycles': {
        id: 'no-cycles',
        description: 'The workflow must not contain direct circular dependencies.',
        run: (nodes, edges) => {
            const errors: ValidationError[] = [];
            
            // Simple direct cycle check first
            const adj = new Map<string, string[]>();
            nodes.forEach(n => adj.set(n.id, []));
            edges.forEach(e => adj.get(e.sourceNodeId)?.push(e.targetNodeId));

            const visited = new Set<string>();
            const stack = new Set<string>();

            function hasCycle(id: string): boolean {
                visited.add(id);
                stack.add(id);

                const neighbors = adj.get(id) || [];
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                        if (hasCycle(neighbor)) return true;
                    } else if (stack.has(neighbor)) {
                        return true;
                    }
                }

                stack.delete(id);
                return false;
            }

            for (const node of nodes) {
                if (!visited.has(node.id)) {
                    if (hasCycle(node.id)) {
                        errors.push({
                            message: "The workflow contains a circular path (cycle).",
                            severity: "error"
                        });
                        break; // only report one generic for now
                    }
                }
            }

            return errors;
        }
    }
};

export class ValidationEngine {
    private rules: ValidationRule[] = [];

    constructor() {
        this.rules = [BuiltInRules['no-orphans'], BuiltInRules['no-cycles']];
    }

    public addRule(rule: ValidationRule): void {
        this.rules.push(rule);
    }

    public validate(nodes: NodeData[], edges: EdgeData[]): ValidationResult {
        const allIssues: ValidationError[] = [];

        this.rules.forEach(rule => {
            allIssues.push(...rule.run(nodes, edges));
        });

        const errors = allIssues.filter(i => i.severity === 'error');
        const warnings = allIssues.filter(i => i.severity === 'warning');

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
}
