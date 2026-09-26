# second-brain-mcp

An MCP (Model Context Protocol) server, internally named **Second-Brain-Bridge**, that bridges an AI assistant to a local Obsidian-style markdown vault and to a codebase on disk. It exposes tools for searching/reading/editing notes, and for pulling together the source of a codebase (for drafting docs like this one).

## Features

- **Search notes** — find markdown notes in your vault by filename.
- **Read notes** — retrieve the full contents of a specific note.
- **Edit notes** — create a new note or overwrite an existing one with new content.
- **Draft README** — recursively collect the contents of a codebase's `.ts`, `.js`, and `.json` files (excluding `.d.ts` and `node_modules`) as raw text, useful as input for an LLM to draft a README.

## Requirements

- Node.js 18+
- npm

## Configuration

The notes tools operate on a vault directory controlled by an environment variable:

```bash
OBSIDIAN_VAULT_PATH=/path/to/your/vault
```

If unset, it falls back to a placeholder path (`C:/whatever-vault`) and prints a warning — set this before real use.

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

Compiles TypeScript from `src/` to `build/`, with `build/index.js` as the executable entry point.

## Usage

Register the server with an MCP-compatible client (e.g. Claude Desktop) by pointing it at `build/index.js`:

```json
{
  "mcpServers": {
    "second-brain": {
      "command": "node",
      "args": ["/path/to/second-brain-mcp/build/index.js"],
      "env": {
        "OBSIDIAN_VAULT_PATH": "/path/to/your/vault"
      }
    }
  }
}
```

**Note:** Claude Desktop only picks up server changes on a full restart — rebuilding the server does not hot-reload an active session.

## Available Tools

| Tool | Description |
|------|-------------|
| `search_notes` | Search local markdown notes by filename |
| `read_note` | Read the full contents of a specific markdown note |
| `edit_note` | Create a new note or overwrite an existing markdown note with new content |
| `draft_readme` | Recursively read a codebase directory's `.ts`/`.js`/`.json` files and return their concatenated contents |

## Known Limitations

- `search_notes` matches only against filenames (not note content).
- `draft_readme` returns raw concatenated source rather than a generated README — an LLM client is expected to turn that into an actual draft.
- `edit_note`'s path-traversal guard checks the resolved path but joins it with `path.join` before normalizing, so a `filename` containing `../` segments should be tested carefully.

## Tech Stack

- TypeScript (strict mode, ES2022 target, Node16 modules)
- [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [`zod`](https://www.npmjs.com/package/zod) for schema validation

## License

ISC

# README Generated using the draft_readme function in this repo with Claude