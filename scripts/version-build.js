/*
 * SPDX-FileCopyrightText: Lilia <lirisia@outlook.ie>
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const fs = require("fs");
const path = require("path");
const { execaSync } = require("execa");

// Path to package.json
const packageJsonPath = path.join(__dirname, "..", "package.json");

// Get the current Git commit hash (short form)
const commitHash = execaSync("git", ["rev-parse", "--short", "HEAD"]).stdout;

// Load package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

// Save the original version
const originalVersion = packageJson.version;

// Temporarily modify the version (add commit hash)
packageJson.version = `${originalVersion}.commit.${commitHash}`;
console.log(`Temporarily changing version to ${packageJson.version}`);

// Write changes
fs.writeFileSync(
	packageJsonPath,
	JSON.stringify(packageJson, null, "\t") + "\n"
);

try {
	// Execute build
	console.log("Starting build process...");
	execaSync("pnpm", ["build"], { stdio: "inherit" });
	console.log(`Build completed (version: ${packageJson.version})`);
} finally {
	// Restore package.json
	packageJson.version = originalVersion;
	fs.writeFileSync(
		packageJsonPath,
		JSON.stringify(packageJson, null, "\t") + "\n"
	);
	console.log(`Restored package version to original ${originalVersion}`);
}
