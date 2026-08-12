#!/usr/bin/env node

/**
 * version-bump.mjs
 *
 * Bumps version across the mnemosyne monorepo workspace packages.
 * Reads the current version from root package.json, applies semver bump,
 * and writes the new version to root and all publishable workspace packages.
 *
 * Usage:
 *   node scripts/version-bump.mjs prerelease   # 1.0.0 → 1.0.1-dev.0
 *   node scripts/version-bump.mjs patch        # 1.0.0 → 1.0.1
 *   node scripts/version-bump.mjs minor        # 1.0.0 → 1.1.0
 *   node scripts/version-bump.mjs major        # 1.0.0 → 2.0.0
 *
 * Outputs the new version string to stdout for use in CI.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Packages to version in lockstep
// ---------------------------------------------------------------------------
const PACKAGES = [
    'packages/mnemosyne-core',
    'packages/mnemosyne-pubsub',
    'packages/mnemosyne-infrastructure-cloudflare',
    'packages/mnemosyne-infrastructure-sqlite',
    'packages/mnemosyne-mcp-server',
    'packages/mnemosyne-streaming',
    'packages/mnemosyne-saas',
    'packages/mnemosyne-cli',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function readJson(relativePath) {
    const full = resolve(ROOT, relativePath);
    const raw = readFileSync(full, 'utf-8');
    return JSON.parse(raw);
}

function writeJson(relativePath, data) {
    const full = resolve(ROOT, relativePath);
    writeFileSync(full, JSON.stringify(data, null, '\t') + '\n', 'utf-8');
}

// ---------------------------------------------------------------------------
// Semver parsing & bumping
// ---------------------------------------------------------------------------
function parseVersion(str) {
    const match = str.match(/^(\d+)\.(\d+)\.(\d+)(?:-([\w.]+))?$/);
    if (!match) throw new Error(`Cannot parse version: ${str}`);
    return {
        major: parseInt(match[1], 10),
        minor: parseInt(match[2], 10),
        patch: parseInt(match[3], 10),
        pre: match[4] || null,
    };
}

function formatVersion(v) {
    let base = `${v.major}.${v.minor}.${v.patch}`;
    if (v.pre) base += `-${v.pre}`;
    return base;
}

function bump(versionStr, mode) {
    const v = parseVersion(versionStr);

    switch (mode) {
        case 'prerelease': {
            // If already a prerelease, bump the numeric suffix
            if (v.pre) {
                const preMatch = v.pre.match(/^(dev)\.(\d+)$/);
                if (preMatch) {
                    const nextNum = parseInt(preMatch[2], 10) + 1;
                    v.pre = `${preMatch[1]}.${nextNum}`;
                } else {
                    // unknown prerelease tag – append .0
                    v.pre = `${v.pre}.0`;
                }
            } else {
                // First prerelease: bump patch, add -dev.0
                v.patch += 1;
                v.pre = 'dev.0';
            }
            break;
        }

        case 'patch':
            v.patch += 1;
            v.pre = null;
            break;

        case 'minor':
            v.minor += 1;
            v.patch = 0;
            v.pre = null;
            break;

        case 'major':
            v.major += 1;
            v.minor = 0;
            v.patch = 0;
            v.pre = null;
            break;

        default:
            throw new Error(`Unknown mode: ${mode}. Use prerelease, patch, minor, or major.`);
    }

    return formatVersion(v);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
    const mode = process.argv[2];
    if (!mode || !['prerelease', 'patch', 'minor', 'major'].includes(mode)) {
        console.error('Usage: node scripts/version-bump.mjs <prerelease|patch|minor|major>');
        process.exit(1);
    }

    const rootPkg = readJson('package.json');
    const currentVersion = rootPkg.version;
    const newVersion = bump(currentVersion, mode);

    console.log(`Current version: ${currentVersion}`);
    console.log(`New version:     ${newVersion}`);
    console.log(`Mode:            ${mode}`);

    // Update root package.json
    rootPkg.version = newVersion;
    writeJson('package.json', rootPkg);

    // Update each workspace package
    for (const pkgDir of PACKAGES) {
        const pkgPath = `${pkgDir}/package.json`;
        const pkg = readJson(pkgPath);
        pkg.version = newVersion;

        // Also update local dependency references if they use file: protocol
        // (They use exact versions, so they don't need updating for local dev,
        //  but keep them in sync anyway.)
        if (pkg.dependencies) {
            for (const [dep, ver] of Object.entries(pkg.dependencies)) {
                if (ver.startsWith('file:')) {
                    // Keep file: references as-is for local development
                    continue;
                }
            }
        }

        writeJson(pkgPath, pkg);
    }

    console.log(`\nUpdated ${1 + PACKAGES.length} package.json files.`);

    // Emit just the version number for CI scripts (last line of stdout)
    console.log(newVersion);
}

main();
