import { FileNode } from "@/types";

export function generateArchitecturePrompt(tree: FileNode[], techStack: any, level: string, readme?: string, packageJson?: string) {
  const treeStr = JSON.stringify(tree, (key, value) => {
    if (key === 'children' && value.length > 50) return `... (${value.length} items)`;
    return value;
  }, 2);
  
  return `
Analyze the provided codebase structure, tech stack, and key documentation to provide a comprehensive architectural overview.
You must BASE your answer on the provided context. If the context is insufficient, state that.

**Context:**
- **Tech Stack:** ${JSON.stringify(techStack, null, 2)}
- **README Check:** ${readme ? "Provided below" : "Not Found"}
- **Package.json Check:** ${packageJson ? "Provided below" : "Not Found"}
- **Project Structure:**
\`\`\`json
${treeStr}
\`\`\`

${readme ? `**README.md Content:**\n\`\`\`markdown\n${readme.slice(0, 5000)}\n\`\`\`\n` : ""}
${packageJson ? `**Package.json Content:**\n\`\`\`json\n${packageJson}\n\`\`\`\n` : ""}

**Audience Level:** ${level} (Adjust complexity and terminology accordingly).

**Task:**
1.  **Project Identity:** What does this project do? (Use the README as source of truth).
2.  **High-Level Architecture:** Describe the overall design pattern (e.g., MVC, Monolith, Microservices, Serverless).
3.  **Key Directories:** Explain the purpose of the top-level folders and how they relate to the architecture.
4.  **Data Flow:** Hypothesize how data moves through the application logic.
5.  **Tech Stack Synergy:** Explain why these specific technologies (dependencies in package.json) might have been chosen together.
6.  **Engineering Quality:** Comment on the visible structure (is it clean? modular?).

**Format:**
Use Markdown with clear headings. Be concise but insightful.
`;
}

export function generateFolderPrompt(path: string, children: FileNode[], level: string) {
  const childrenStr = children.map(c => `- ${c.name} (${c.type})`).join("\n");

  return `
Analyze the specific directory: \`${path}\`.

**Contents:**
${childrenStr}

**Audience Level:** ${level}

**Task:**
1.  **Purpose:** What is the specific responsibility of this folder within the project?
2.  **Key Files:** Identify the most important files (based on naming conventions) and what they likely do.
3.  **Relationships:** How does this folder likely interact with sibling or parent directories?

**Format:**
Markdown. Keep it brief and focused on this folder's role.
`;
}

export function generateFilePrompt(path: string, content: string, imports: string[], level: string) {
  return `
Explain the source code file: \`${path}\`.

**Context:**
- **Imports:** ${imports.length > 0 ? imports.join(", ") : "None"}
- **Code:**
\`\`\`${path.split('.').pop() || 'ts'}
${content.slice(0, 15000)} ${content.length > 15000 ? "\n... (truncated)" : ""}
\`\`\`

**Audience Level:** ${level}

**Task:**
1.  **Summary:** One sentence describing what this file does.
2.  **Key Components:** Break down the main functions, classes, or exported constants.
3.  **Logic Flow:** Explain the core logic path. How does data transform here?
4.  **Dependencies:** Briefly explain why it imports what it imports.
5.  **Improvement Suggestions:** (Optional) If you see obvious improvements or best practices missing, mention them.

**Format:**
Markdown. specialized for educational explanation.
`;
}
