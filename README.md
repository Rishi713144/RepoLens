# Explain My Code

A production-grade Next.js application that analyzes and explains GitHub repositories using AI.

## Features

- **Repo Ingestion**: Fetches repository structure and content via GitHub API.
- **Analysis**:
  - File Tree visualization.
  - Dependency Graph (using AST parsing for JS/TS).
  - Tech Stack detection.
- **AI Explanations**:
  - Streaming explanations for Architecture, Folders, and Files.
  - Tailored to user level (Junior/Mid/Senior).
- **Modern Tech**: Next.js App Router, TypeScript, Tailwind CSS, React Flow.

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up Environment Variables (Optional for real AI):
   Create `.env.local`:
   ```
   OPENAI_API_KEY=sk-...
   GITHUB_TOKEN=ghp_... (Optional, for higher rate limits)
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Architecture

- **`app/`**: App Router pages and API routes.
- **`components/`**: UI components (shadcn/ui style), feature-specific components (`explain`, `graph`).
- **`lib/`**: Business logic.
  - `github/`: API interaction.
  - `analysis/`: AST parsing, tree building.
  - `ai/`: Prompts and streaming service.
- **`types/`**: Shared TypeScript definitions.

