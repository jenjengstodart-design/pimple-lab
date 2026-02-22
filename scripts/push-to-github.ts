import { Octokit } from "@octokit/rest";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const OWNER = "jenjengstodart-design";
const REPO = "pimple-lab";
const BRANCH = "main";

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? "depl " + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found");
  }

  connectionSettings = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=github",
    {
      headers: {
        Accept: "application/json",
        X_REPLIT_TOKEN: xReplitToken,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);

  const accessToken =
    connectionSettings?.settings?.access_token ||
    connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error("GitHub not connected");
  }
  return accessToken;
}

function getTrackedFiles(): string[] {
  const output = execSync("git ls-files", { cwd: "/home/runner/workspace", encoding: "utf-8" });
  return output.trim().split("\n").filter(Boolean);
}

async function initializeEmptyRepo(octokit: Octokit) {
  console.log("Initializing empty repo with README...");
  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: "README.md",
    message: "Initial commit",
    content: Buffer.from("# Pimple Lab\n").toString("base64"),
  });
  console.log("Repo initialized.");
  await new Promise((r) => setTimeout(r, 2000));
}

async function pushToGitHub() {
  console.log("Getting GitHub access token...");
  const token = await getAccessToken();
  const octokit = new Octokit({ auth: token });

  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Authenticated as: ${user.login}`);

  let parentSha: string | undefined;
  try {
    const ref = await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`,
    });
    parentSha = ref.data.object.sha;
    console.log(`Existing branch found, parent: ${parentSha}`);
  } catch (e: any) {
    if (e.status === 404 || e.status === 409) {
      await initializeEmptyRepo(octokit);
      const ref = await octokit.git.getRef({
        owner: OWNER,
        repo: REPO,
        ref: `heads/${BRANCH}`,
      });
      parentSha = ref.data.object.sha;
    } else {
      throw e;
    }
  }

  console.log("Collecting tracked files...");
  const files = getTrackedFiles();
  console.log(`Found ${files.length} tracked files`);

  console.log("Creating blobs...");
  const treeItems: any[] = [];

  for (const filePath of files) {
    const fullPath = path.join("/home/runner/workspace", filePath);
    if (!fs.existsSync(fullPath)) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) continue;

    const content = fs.readFileSync(fullPath);

    let blob;
    try {
      const utf8 = content.toString("utf-8");
      if (Buffer.from(utf8, "utf-8").equals(content)) {
        blob = await octokit.git.createBlob({
          owner: OWNER,
          repo: REPO,
          content: utf8,
          encoding: "utf-8",
        });
      } else {
        throw new Error("binary");
      }
    } catch {
      blob = await octokit.git.createBlob({
        owner: OWNER,
        repo: REPO,
        content: content.toString("base64"),
        encoding: "base64",
      });
    }

    treeItems.push({
      path: filePath,
      mode: "100644" as const,
      type: "blob" as const,
      sha: blob.data.sha,
    });

    if (treeItems.length % 10 === 0) {
      console.log(`  Uploaded ${treeItems.length}/${files.length} files...`);
    }
  }

  console.log(`Uploaded all ${treeItems.length} files`);

  console.log("Creating tree...");
  const tree = await octokit.git.createTree({
    owner: OWNER,
    repo: REPO,
    tree: treeItems,
  });

  console.log("Creating commit...");
  const commit = await octokit.git.createCommit({
    owner: OWNER,
    repo: REPO,
    message: "Pimple Lab - full project push from Replit",
    tree: tree.data.sha,
    parents: parentSha ? [parentSha] : [],
  });

  console.log("Updating branch reference...");
  await octokit.git.updateRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
    sha: commit.data.sha,
    force: true,
  });

  console.log(`\nSuccessfully pushed to https://github.com/${OWNER}/${REPO}`);
}

pushToGitHub().catch((err) => {
  console.error("Push failed:", err.message);
  process.exit(1);
});
