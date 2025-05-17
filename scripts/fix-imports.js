const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern to match imports of useAuth from AuthContext
const importPattern = /import\s*\{\s*useAuth(?:\s+as\s+[a-zA-Z_$][0-9a-zA-Z_$]*)?\s*\}\s*from\s*["'](.+?)\/contexts\/AuthContext["'];/g;

// New import statement
const newImport = 'import { useAuth } from "$1/contexts";';

// Function to process file content
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if the file doesn't contain the pattern
    if (!importPattern.test(content)) {
      return { skipped: true };
    }
    
    // Reset the lastIndex to ensure we find all occurrences
    importPattern.lastIndex = 0;
    
    // Replace the imports
    const updatedContent = content.replace(importPattern, newImport);
    
    // Only write if changes were made
    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      return { updated: true };
    }
    
    return { skipped: true };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { error: true };
  }
}

// Find all TypeScript files in the src directory
const files = glob.sync('src/**/*.{ts,tsx}', { cwd: path.resolve(__dirname, '..') });

// Process each file
const results = {
  updated: [],
  skipped: [],
  errors: []
};

files.forEach(file => {
  const filePath = path.resolve(__dirname, '..', file);
  const result = processFile(filePath);
  
  if (result.updated) {
    results.updated.push(file);
  } else if (result.skipped) {
    results.skipped.push(file);
  } else {
    results.errors.push(file);
  }
});

// Print summary
console.log(`\nImport Fix Summary:`);
console.log(`=================`);
console.log(`Updated: ${results.updated.length} files`);
console.log(`Skipped: ${results.skipped.length} files`);
console.log(`Errors: ${results.errors.length} files`);

if (results.updated.length > 0) {
  console.log(`\nUpdated Files:`);
  results.updated.forEach(file => console.log(`- ${file}`));
}

if (results.errors.length > 0) {
  console.log(`\nFiles with Errors:`);
  results.errors.forEach(file => console.log(`- ${file}`));
}
