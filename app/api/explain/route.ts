import { NextRequest, NextResponse } from "next/server";
import { streamCompletion, generateArchitecturePrompt, generateFolderPrompt, generateFilePrompt } from "@/lib/ai";
import { FileNode } from "@/types";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { type, context, level } = await req.json();

    let prompt = "";

    if (type === "architecture") {
        prompt = generateArchitecturePrompt(
            context.tree, 
            context.techStack, 
            level, 
            context.readme, 
            context.packageJson
        );
    } else if (type === "folder") {
        prompt = generateFolderPrompt(context.path, context.children, level);
    } else if (type === "file") {
        prompt = generateFilePrompt(context.path, context.content, context.imports, level);
    } else {
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const stream = await streamCompletion(prompt, apiKey);

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    });

  } catch (error: any) {
    console.error("Explanation failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
