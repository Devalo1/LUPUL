/**
 * Script to check for outdated dependencies
 * 
 * This script analyzes package.json and checks for outdated dependencies
 * It provides recommendations for updating packages based on semver rules
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Read package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log(chalk.blue('Checking for outdated dependencies...'));

try {
  // Run npm outdated in JSON format
  const outdatedOutput = execSync('npm outdated --json', { encoding: 'utf8' });
  const outdatedPackages = JSON.parse(outdatedOutput || '{}');
  
  // Count total outdated packages
  const totalOutdated = Object.keys(outdatedPackages).length;
  
  if (totalOutdated === 0) {
    console.log(chalk.green('✓ All dependencies are up to date!'));
    process.exit(0);
  }
  
  console.log(chalk.yellow(`Found ${totalOutdated} outdated packages:`));
  
  // Categorize updates by type (major, minor, patch)
  const major = [];
  const minor = [];
  const patch = [];
  
  Object.entries(outdatedPackages).forEach(([name, info]) => {
    const currentVersion = info.current;
    const latestVersion = info.latest;
    
    const currentParts = currentVersion.split('.');
    const latestParts = latestVersion.split('.');
    
    if (latestParts[0] > currentParts[0]) {
      major.push({ name, current: currentVersion, latest: latestVersion });
    } else if (latestParts[1] > currentParts[1]) {
      minor.push({ name, current: currentVersion, latest: latestVersion });
    } else {
      patch.push({ name, current: currentVersion, latest: latestVersion });
    }
  });
  
  // Display results by category
  if (patch.length > 0) {
    console.log(chalk.green('\n✓ Safe patch updates (backward compatible bug fixes):'));
    patch.forEach(pkg => {
      console.log(`  ${pkg.name}: ${pkg.current} → ${chalk.green(pkg.latest)}`);
    });
  }
  
  if (minor.length > 0) {
    console.log(chalk.blue('\n! Minor updates (backward compatible features):'));
    minor.forEach(pkg => {
      console.log(`  ${pkg.name}: ${pkg.current} → ${chalk.blue(pkg.latest)}`);
    });
  }
  
  if (major.length > 0) {
    console.log(chalk.red('\n⚠ Major updates (may include breaking changes):'));
    major.forEach(pkg => {
      console.log(`  ${pkg.name}: ${pkg.current} → ${chalk.red(pkg.latest)}`);
    });
  }
  
  // Generate update commands
  console.log('\nUpdate commands:');
  
  if (patch.length > 0) {
    console.log(chalk.green('\nTo update patch versions:'));
    console.log(`npm install ${patch.map(pkg => `${pkg.name}@${pkg.latest}`).join(' ')}`);
  }
  
  if (minor.length > 0) {
    console.log(chalk.blue('\nTo update minor versions:'));
    console.log(`npm install ${minor.map(pkg => `${pkg.name}@${pkg.latest}`).join(' ')}`);
  }
  
  if (major.length > 0) {
    console.log(chalk.red('\nTo update major versions (test thoroughly):'));
    console.log(`npm install ${major.map(pkg => `${pkg.name}@${pkg.latest}`).join(' ')}`);
  }
  
  console.log(chalk.yellow('\nTo update all packages (not recommended):'));
  console.log('npm update');
  
} catch (error) {
  console.error(chalk.red('Error checking for outdated dependencies:'));
  console.error(error.message);
  process.exit(1);
}
