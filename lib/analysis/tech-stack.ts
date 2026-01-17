import { TechStackConfig } from "@/types";

export function detectTechStack(files: { path: string }[]): TechStackConfig {
  const frameworks = new Set<string>();
  const languages = new Set<string>();
  const tools = new Set<string>();

  const paths = new Set(files.map(f => f.path.toLowerCase()));

  if (paths.has("next.config.js") || paths.has("next.config.mjs") || paths.has("next.config.ts")) frameworks.add("Next.js");
  if (paths.has("remix.config.js")) frameworks.add("Remix");
  if (paths.has("gatsby-config.js")) frameworks.add("Gatsby");
  if (paths.has("nuxt.config.js") || paths.has("nuxt.config.ts")) frameworks.add("Nuxt");
  if (paths.has("angular.json")) frameworks.add("Angular");
  if ([...paths].some(p => p.endsWith(".ts") || p.endsWith(".tsx"))) languages.add("TypeScript");
  if ([...paths].some(p => p.endsWith(".js") || p.endsWith(".jsx"))) languages.add("JavaScript");
  if ([...paths].some(p => p.endsWith(".py"))) languages.add("Python");
  if ([...paths].some(p => p.endsWith(".rs"))) languages.add("Rust");
  if ([...paths].some(p => p.endsWith(".go"))) languages.add("Go");
  if ([...paths].some(p => p.endsWith(".java"))) languages.add("Java");
  if ([...paths].some(p => p.endsWith(".rb"))) languages.add("Ruby");
  if ([...paths].some(p => p.endsWith(".php"))) languages.add("PHP");
  if (paths.has("tailwind.config.js") || paths.has("tailwind.config.ts")) tools.add("Tailwind CSS");
  if (paths.has("dockerfile")) tools.add("Docker");
  if (paths.has("prisma/schema.prisma")) tools.add("Prisma");
  if (paths.has(".eslintrc.json") || paths.has(".eslintrc.js")) tools.add("ESLint");
  if (paths.has("tsconfig.json")) tools.add("TypeScript Config");
  if (paths.has("vite.config.ts") || paths.has("vite.config.js")) tools.add("Vite");

  return {
    frameworks: Array.from(frameworks),
    languages: Array.from(languages),
    tools: Array.from(tools),
  };
}
