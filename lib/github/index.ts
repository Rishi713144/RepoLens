interface GitHubTreeItem {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
  url: string;
}

interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("github.com")) return null;
    
    const parts = parsed.pathname.replace(/^\/|\/$/g, "").split("/").filter(Boolean);
    if (parts.length < 2) return null;
    
    return { owner: parts[0], repo: parts[1].replace(".git", "") };
  } catch {
    return null;
  }
}

export async function fetchRepoFileTree(owner: string, repo: string, branch = "HEAD"): Promise<GitHubTreeItem[]> {
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  
  const treeRes = await fetch(treeUrl, {
     headers: {
      Accept: "application/vnd.github.v3+json",
      ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
    },
    next: { revalidate: 3600 }
  });

  if (!treeRes.ok) {
     if (treeRes.status === 403) {
       throw new Error("GitHub API rate limit exceeded. Please try again later.");
    }
     if (treeRes.status === 404) {
       throw new Error("Repository not found or private.");
     }
    throw new Error(`Failed to fetch file tree: ${treeRes.statusText}`);
  }

  const treeData: GitHubTreeResponse = await treeRes.json();
  
  if (treeData.truncated) {
    console.warn("Tree is truncated. Some files might be missing.");
  }

  return treeData.tree;
}

export async function fetchFileContent(owner: string, repo: string, path: string): Promise<string> {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${path}`;
    const res = await fetch(url);
    if (!res.ok) return "";
    return res.text();
}
