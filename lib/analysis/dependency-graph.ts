import ts from "typescript";

export function getImports(fileName: string, content: string): string[] {
    const imports: string[] = [];
    
    if (!/\.(js|jsx|ts|tsx|mjs|cjs)$/.test(fileName)) return [];

    try {
        const sourceFile = ts.createSourceFile(
            fileName,
            content,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TSX
        );

        function visit(node: ts.Node) {
            if (ts.isImportDeclaration(node)) {
                if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
                    imports.push(node.moduleSpecifier.text);
                }
            } else if (ts.isExportDeclaration(node)) { 
                 if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
                    imports.push(node.moduleSpecifier.text);
                }
            }
            else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
                 const arg = node.arguments[0];
                 if (arg && ts.isStringLiteral(arg)) {
                     imports.push(arg.text);
                 }
            }

            ts.forEachChild(node, visit);
        }

        visit(sourceFile);
    } catch (e) {
    }

    return imports;
}

export function resolveImportPath(currentPath: string, importPath: string): string {
    if (!importPath.startsWith(".")) return importPath;

    const currentDir = currentPath.split("/").slice(0, -1);
    const parts = importPath.split("/");

    const result = [...currentDir];

    for (const part of parts) {
        if (part === ".") continue;
        if (part === "..") {
            result.pop();
        } else {
            result.push(part);
        }
    }

    return result.join("/");
}
