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
	// Execute dev script
	console.log("Starting development server...");
	execaSync("node", ["scripts/dev.mjs"], { stdio: "inherit" });
	console.log(`Development server stopped (version: ${packageJson.version})`);
} finally {
	// Restore package.json
	packageJson.version = originalVersion;
	fs.writeFileSync(
		packageJsonPath,
		JSON.stringify(packageJson, null, "\t") + "\n"
	);
	console.log(`Restored package version to original ${originalVersion}`);
}
