#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { searchNotes, readNote, editNote, readCode } from "./services/markdown.js";

// 1. Initialize the server
const server = new McpServer({
  name: "Second-Brain-Bridge",
  version: "1.0.0",
});

// 2. Register tools with Zod schemas for the LLM
server.tool(
  "search_notes",
  "Search local markdown notes by filename",
  {
    query: z.string().describe("The topic or keyword to search for in filenames"),
  },
  async ({ query }) => {
    try {
      const results = await searchNotes(query);
      return {
        content: [
          {
            type: "text",
            text: results.length > 0 
              ? `Found notes:\n${results.join('\n')}` 
              : "No notes found matching that query.",
          },
        ],
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error}` }] };
    }
  }
);

server.tool(
  "read_note",
  "Read the full contents of a specific markdown note",
  {
    filename: z.string().describe("The exact filename including .md extension"),
  },
  async ({ filename }) => {
    try {
      const content = await readNote(filename);
      return { content: [{ type: "text", text: content }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error reading file: ${error}` }] };
    }
  }
);

server.tool(
  "edit_note",
  "Create a new note or overwrite an existing markdown note with new content",
  {
    filename: z.string().describe("The exact filename including .md extension"),
    content: z.string().describe("The full markdown content to save to the file"),
  },
  async ({ filename, content }) => {
    try {
      await editNote(filename, content);
      return { 
        content: [
          { 
            type: "text", 
            text: `Success: Saved ${filename} successfully.` 
          }
        ] 
      };
    } catch (error) {
      return { 
        content: [
          { 
            type: "text", 
            text: `Error writing to file: ${error}` 
          }
        ] 
      };
    }
  }
);

server.tool(
  "draft_readme",
  "Draft a README.md file for a codebase by reading all .ts, .js, and .json files in the specified directory",
  {
    codePath: z.string().describe("The path to the codebase directory"),
  },
  async ({ codePath }) => {
    try {
      const codeContents = await readCode(codePath);
      return { content: [{ type: "text", text: codeContents }] };
    }
    catch (error) {
      return { content: [{ type: "text", text: `Error reading code: ${error}` }] };
    }
  }
);

// 3. Start the transport to listen for LLM requests
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Second Brain MCP Server running on stdio");
}

main().catch(console.error);