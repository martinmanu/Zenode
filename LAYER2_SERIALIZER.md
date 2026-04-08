Zenode Serializer — Development Prompt
Objective

Build a standalone, framework-agnostic serialization library that converts workflow data between multiple formats using Zenode JSON as the canonical data model.

The library must work independently, while integrating seamlessly with the Zenode ecosystem.

Core Principle

Zenode JSON (ZenodeDiagramState) is the single source of truth.

All transformations must follow this pattern:

External Format → Zenode JSON → External Format

No direct format-to-format conversions should exist.

Scope of the Serializer

The serializer is responsible only for:

Parsing external formats into Zenode JSON
Emitting Zenode JSON into external formats
Validating data integrity

It must not include:

UI logic
Rendering logic
Execution/runtime behavior
Canonical Data Model

Use ZenodeDiagramState as the central schema.

Requirements:

Must include versioning (e.g. "1.0")
Must support nodes, edges, and metadata
Nodes must support meta: Record<string, any> for extensibility
Structure must be stable and version-aware

The serializer must treat this format as authoritative.

Architecture

Organize the package with clear separation of concerns:

packages/serializer/src/
  ├── formats/
  │    ├── json.ts
  │    ├── mermaid.ts
  │    ├── bpmn.ts
  │    └── index.ts
  ├── core/
  │    ├── parser.ts
  │    ├── emitter.ts
  │    ├── validator.ts
  │    └── registry.ts
  ├── utils/
  │    ├── graph.ts
  │    ├── guards.ts
  │    └── ids.ts
  └── index.ts

Each format must be isolated and independently testable.

Public API Design

Expose a simple and predictable API:

serialize(input, { from: 'json', to: 'mermaid' })
deserialize(input, { from: 'mermaid', to: 'json' })

OR explicit helpers:

toMermaid(json)
fromMermaid(mermaid)

toBPMN(json)
fromBPMN(xml)

Avoid over-generalization in early versions.

Validation Requirements

Implement strict validation for Zenode JSON:

Required fields must exist
Node and edge structure must be valid
All referenced node IDs must exist
No broken or dangling connections

Validation must run before any transformation.

Invalid input should return structured errors, not silent failures.

Metadata Handling

Nodes and edges may contain meta: Record<string, any>.

Rules:

Metadata must be preserved during transformations
Do not modify metadata unless explicitly required by a format
Unknown metadata should pass through untouched
Mermaid Serializer (First Target)

Implement Mermaid as the first external format.

Responsibilities:

Convert Zenode nodes and edges into valid Mermaid flowchart syntax
Support basic node types and labels
Handle directional connections
Ensure output is readable and deterministic

Do not aim for full feature parity initially. Focus on correctness and clarity.

Testing Strategy

Set up a full test suite using Vitest.

Required tests:

Validation tests
Valid input passes
Invalid input fails with clear errors
Transformation tests
Zenode JSON → Mermaid produces expected output
Round-trip tests
JSON → Mermaid → JSON should preserve structure as much as possible
Edge cases
Empty graphs
Single node
Cyclic graphs

Tests must be deterministic and prevent regressions.

Versioning Strategy

Respect the version field in Zenode JSON.

The serializer must:

Validate supported versions
Be forward-compatible where possible
Allow future migration logic to be added cleanly
Constraints
Do not couple serializer logic with the designer
Do not introduce execution logic
Do not assume UI-specific properties
Keep functions pure and deterministic
Expected Outcome

The serializer should:

Convert between formats reliably
Be usable as a standalone library
Serve as the foundation for future layers (runtime, transformer)
Maintain data integrity across transformations
Success Criteria

The implementation is complete when:

Zenode JSON schema is validated and stable
Mermaid export works reliably
Round-trip tests pass
API is simple and predictable
No coupling exists with UI or runtime laye