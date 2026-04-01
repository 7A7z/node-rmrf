#!/usr/bin/env bun

import { existsSync, statSync, rmSync, readdirSync } from "fs";
import { resolve, basename, dirname, relative } from "path";
import {
  multiselect,
  isCancel,
  cancel,
  intro,
  outro,
  log,
  spinner,
  confirm,
} from "@clack/prompts";

interface NodeModulesInfo {
  path: string;
  displayName: string;
  parentDir: string;
}

function findNodeModules(baseDir: string): NodeModulesInfo[] {
  const results: NodeModulesInfo[] = [];
  const visited = new Set<string>();

  function scanDir(dir: string, depth: number = 0): void {
    if (depth > 10) return;

    const normalizedDir = resolve(dir);
    if (visited.has(normalizedDir)) return;
    visited.add(normalizedDir);

    try {
      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const entryPath = resolve(dir, entry.name);

        if (entry.name === "node_modules") {
          const parentDir = dirname(entryPath);
          const parentName = basename(parentDir);
          const displayName = `${parentName}-modules`;

          results.push({
            path: entryPath,
            displayName,
            parentDir,
          });

          continue;
        }

        scanDir(entryPath, depth + 1);
      }
    } catch (error) {
      // Permission denied or other errors - skip
    }
  }

  scanDir(baseDir);
  return results;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function getDirectorySize(dirPath: string): number {
  let totalSize = 0;

  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = resolve(dirPath, entry.name);

      if (entry.isDirectory()) {
        totalSize += getDirectorySize(entryPath);
      } else {
        try {
          const stats = statSync(entryPath);
          totalSize += stats.size;
        } catch {
          // Skip files we can't stat
        }
      }
    }
  } catch {
    // Skip directories we can't read
  }

  return totalSize;
}

async function main() {
  console.log("DEBUG → isTTY:", process.stdin.isTTY, process.stdout.isTTY);
  console.log("DEBUG → cwd:", process.cwd());

  intro("🗑️  Node Modules Cleaner");

  const targetDir = process.argv[2] ? resolve(process.argv[2]) : process.cwd();

  log.info(`Scanning: ${targetDir}`);

  if (!existsSync(targetDir)) {
    log.error(`Directory does not exist: ${targetDir}`);
    cancel("Operation cancelled.");
    process.exit(1);
  }

  const stats = statSync(targetDir);
  if (!stats.isDirectory()) {
    log.error(`Not a directory: ${targetDir}`);
    cancel("Operation cancelled.");
    process.exit(1);
  }

  // Scan with spinner
  const s = spinner();
  s.start("Scanning for node_modules folders...");

  const nodeModulesList = findNodeModules(targetDir);

  s.stop(`Found ${nodeModulesList.length} node_modules folder(s) \n Please wait while we calculate their sizes...`);
  if (nodeModulesList.length === 0) {
    log.info("No node_modules folders found.");
    outro("All done!");
    process.exit(0);
  }


  

  // Prepare choices for the multiselect
  const choices = nodeModulesList.map((nm) => {
    const size = getDirectorySize(nm.path);
    const sizeStr = formatSize(size);

    return {
      label: nm.displayName,
      value: nm.path,
      hint: `${relative(process.cwd(), nm.path)} - ${sizeStr}`,
    };
  });

  
  // Show multiselect
  const selectedPaths = await multiselect({
    message: "Select node_modules folders to delete:",
    options: choices,
    required: false,
  });

  if (isCancel(selectedPaths)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  if (!selectedPaths || selectedPaths.length === 0) {
    log.info("No folders selected. Exiting.");
    outro("All done!");
    process.exit(0);
  }

  log.info(`Selected ${selectedPaths.length} folder(s) for deletion.`);

  // Confirm before deleting
  const shouldDelete = await confirm({
    message: `Are you sure you want to delete ${selectedPaths.length} node_modules folder(s)?`,
  });

  if (isCancel(shouldDelete) || !shouldDelete) {
    cancel("Deletion cancelled.");
    process.exit(0);
  }

  // Delete selected folders
  log.step("Deleting selected folders...");

  let deletedCount = 0;
  let failedCount = 0;

  for (const path of selectedPaths) {
    try {
      rmSync(path, { recursive: true, force: true });
      log.success(`Deleted: ${basename(dirname(path))}-modules`);
      deletedCount++;
    } catch (error) {
      log.error(`Failed to delete ${path}: ${error}`);
      failedCount++;
    }
  }

  log.step("Summary");
  log.info(`Total folders found: ${nodeModulesList.length}`);
  log.info(`Selected for deletion: ${selectedPaths.length}`);
  log.success(`Successfully deleted: ${deletedCount}`);
  if (failedCount > 0) {
    log.error(`Failed to delete: ${failedCount}`);
    outro("Completed with errors");
    process.exit(1);
  }

  outro("All done! ✨");
}

main().catch((error) => {
  log.error("Unexpected error:", error);
  process.exit(1);
});
