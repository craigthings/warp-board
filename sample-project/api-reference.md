# API Reference

Complete reference for the internal APIs and data structures.

---

## Board JSON Schema

```json
{
  "version": "1.0",
  "projectName": "string",
  "rootMarkdown": "string",
  "cards": [
    {
      "id": "string (uuid)",
      "markdownPath": "string (relative path)",
      "x": "number",
      "y": "number",
      "width": "number",
      "height": "number",
      "connections": [
        {
          "targetId": "string",
          "type": "to | from | bidirectional"
        }
      ]
    }
  ]
}
```

## Markdown Format

Documents follow a simple format:

```markdown
# Title

Description text here.

---

Body content below the separator...
```

## IPC Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `file:read` | Renderer → Main | Read file contents |
| `file:write` | Renderer → Main | Write file contents |
| `project:open` | Renderer → Main | Open file dialog |

