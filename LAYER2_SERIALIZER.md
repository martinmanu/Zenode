# Zenode Serializer (Layer 2) — Scope & Responsibilities

## Purpose
Layer 2 is responsible for transforming Zenode JSON into other formats and back.

---

## ✅ Responsibilities

- Convert JSON → External formats
- Convert External formats → JSON

---

## Supported Formats

- JSON (pass-through)
- BPMN 2.0 XML
- Mermaid
- DOT
- Custom DSL

---

## API Design

```ts
serializer.toBPMN(json)
serializer.toMermaid(json)
serializer.toDOT(json)

serializer.fromBPMN(xml)
serializer.fromDSL(dsl)
```

---

## Rules

- No rendering logic
- No D3
- No DOM
- Pure transformation layer

---

## Input

Zenode JSON:
```json
{
  "nodes": [],
  "edges": []
}
```

---

## Output

- XML / String / DSL formats

---

## ❌ Not Allowed

- UI rendering
- Workflow execution
- Canvas logic
