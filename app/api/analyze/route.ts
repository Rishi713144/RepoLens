import { NextRequest, NextResponse } from "next/server";
import { parseGitHubUrl, fetchRepoFileTree, fetchFileContent } from "@/lib/github";
import { buildFileTree, detectTechStack, getImports, resolveImportPath } from "@/lib/analysis";
import { RepoAnalysisResult, DependencyNode } from "@/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { repoUrl } = await req.json();

    if (!repoUrl) {
      return NextResponse.json({ error: "Repo URL is required" }, { status: 400 });
    }

    const repoInfo = parseGitHubUrl(repoUrl);
    if (!repoInfo) {
      return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
    }

    const { owner, repo } = repoInfo;

    const flatTree = await fetchRepoFileTree(owner, repo);
    const fileTree = buildFileTree(flatTree);

    const techStack = detectTechStack(flatTree);

    const readmeNode = flatTree.find(f => f.path.toLowerCase() === 'readme.md');
    const pkgNode = flatTree.find(f => f.path.toLowerCase() === 'package.json');
    
    const contextPromises = [];
    if (readmeNode) contextPromises.push(fetchFileContent(owner, repo, readmeNode.path).then(c => ({ type: 'readme', content: c })));
    if (pkgNode) contextPromises.push(fetchFileContent(owner, repo, pkgNode.path).then(c => ({ type: 'pkg', content: c })));

    const sourceFiles = flatTree
        .filter(f => /\.(js|jsx|ts|tsx)$/.test(f.path) && !f.path.includes('.d.ts') && !f.path.includes('.test.') && !f.path.includes('.spec.'))
        .slice(0, 20);
    sourceFiles.forEach(file => {
        contextPromises.push(fetchFileContent(owner, repo, file.path).then(c => ({ type: 'source', path: file.path, content: c })));
    });

    const allfetched = await Promise.all(contextPromises);
    
    const readmeContent = allfetched.find(f => f.type === 'readme')?.content;
    const packageJsonContent = allfetched.find(f => f.type === 'pkg')?.content;
    const fileContents = allfetched.filter(f => f.type === 'source') as { type: 'source', path: string, content: string }[];
    
    const dependencyGraph: DependencyNode[] = [];

    for (const { path, content } of fileContents) {
        const imports = getImports(path, content);
        const resolvedImports = imports.map(imp => {
             if (imp.startsWith(".")) return resolveImportPath(path, imp);
             return imp;
        });

        dependencyGraph.push({
            id: path,
            path: path,
            imports: resolvedImports,
          importedBy: []
        });
    }

    const result: RepoAnalysisResult = {
        fileTree,
        dependencyGraph,
        techStack,
        readmeContent,
        packageJsonContent,
        summary: `Analyzed ${flatTree.length} files. Detected ${techStack.frameworks.join(", ")}.`
    };

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Analysis failed for:", req.url);
    if (error instanceof Error) {
        console.error(error.message);
        console.error(error.stack);
    } else {
        console.error(error);
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
