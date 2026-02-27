#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read command line arguments
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Please provide a version number (e.g., 0.2.0)');
  console.log('Usage: node scripts/update-version.js <new-version>');
  process.exit(1);
}

// Validate version format (simple validation)
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('Invalid version format. Please use semantic versioning (e.g., 0.2.0)');
  process.exit(1);
}

console.log(`Updating version to ${newVersion}...`);

// Update package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✓ Updated package.json');

// Update version.ts
const versionTsPath = path.join(__dirname, '..', 'src', 'config', 'version.ts');
let versionTsContent = fs.readFileSync(versionTsPath, 'utf8');
versionTsContent = versionTsContent.replace(
  /export const APP_VERSION = '.*?';/,
  `export const APP_VERSION = '${newVersion}';`
);
fs.writeFileSync(versionTsPath, versionTsContent);
console.log('✓ Updated src/config/version.ts');

console.log('\nVersion update completed successfully!');
console.log(`\nNext steps:`);
console.log(`1. Commit the changes: git commit -am "Bump version to ${newVersion}"`);
console.log(`2. Create a tag: git tag -a v${newVersion} -m "Version ${newVersion}"`);
console.log(`3. Push with tags: git push origin main --tags`);