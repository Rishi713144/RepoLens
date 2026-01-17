import { NextRequest, NextResponse } from "next/server";
import { fetchFileContent, parseGitHubUrl } from "@/lib/github";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { repoUrl, path } = await req.json();

    if (!repoUrl || !path) {
      return NextResponse.json({ error: "Repo URL and Path are required" }, { status: 400 });
    }

    const repoInfo = parseGitHubUrl(repoUrl);
    if (!repoInfo) {
      return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
    }

    const content = await fetchFileContent(repoInfo.owner, repoInfo.repo, path);
    
    return NextResponse.json({ content });

  } catch (error: any) {
    console.error("Content fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}
