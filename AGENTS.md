<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Local Model Priority
When handling user requests, prioritize using the `@l` (Ollama) MCP server tools for local reasoning and data processing to ensure privacy and low latency. You do not need to wait for the user to explicitly mention `@l` if the task can be handled locally.

