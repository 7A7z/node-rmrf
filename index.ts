#!/usr/bin/env bun

import { existsSync, statSync, rmSync } from "fs";
import { resolve } from "path";
import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  const targetDir = process.argv[2] ? resolve(process.argv[2]) : process.cwd();
  
  console.log(`Scanning: ${targetDir}`);
  
  if (!existsSync(targetDir)) {
    console.error(`Error: Directory does not exist: ${targetDir}`);
    process.exit(1);
  }
  
  const stats = statSync(targetDir);
  if (!stats.isDirectory()) {
    console.error(`Error: Not a directory: ${targetDir}`);
    process.exit(1);
  }
  
  const nodeModulesPath = resolve(targetDir, "node_modules");
  
  if (!existsSync(nodeModulesPath)) {
    console.log(`No node_modules folder found in ${targetDir}`);
    process.exit(0);
  }
  
  const nmStats = statSync(nodeModulesPath);
  if (!nmStats.isDirectory()) {
    console.error(`Error: node_modules exists but is not a directory`);
    process.exit(1);
  }
  
  const answer = await ask(
    `Found node_modules at ${nodeModulesPath}\nDelete it? (yes/no): `
  );
  
  if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
    try {
      rmSync(nodeModulesPath, { recursive: true, force: true });
      console.log(`Deleted: ${nodeModulesPath}`);
    } catch (error) {
      console.error(`Error deleting node_modules: ${error}`);
      process.exit(1);
    }
  } else {
    console.log("Cancelled. node_modules was not deleted.");
  }
  
  rl.close();
}

main();
