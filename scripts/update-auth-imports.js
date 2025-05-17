// This script updates all imports that reference AuthContext.tsx to use the new useAuth hook

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const rootDir = path.resolve(__dirname, '..');

// Pattern to match problematic imports
const oldImportPattern = /import\s*\{\s*useAuth\s*\}\s*from\s*["'](.+?)\/contexts\/AuthContext["']/g;
const enhancedImportPattern = /import\s*\{\s*useAuth\s*\}\s*from\s*["'](.+?)\/contexts\/EnhancedAuthContext(Provider)?["']/g;

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if this file needs fixing
    if (!oldImportPattern.test(content) && !enhancedImportPattern.test(content)) {
      return false; // No changes needed
    }
    
    // Reset the regex lastIndex
    oldImportPattern.lastIndex = 0;
    enhancedImportPattern.lastIndex = 0;
    
    // Determine relative path to contexts directory
    const relativePath = path.relative(path.dirname(filePath), path.join(rootDir, 'src', 'contexts'));
    const normalizedPath = relativePath.split(path.sep).join('/');
    
    // Replace imports
    const newContent = content
      .replace(oldImportPattern, `import { useAuth } from "${normalizedPath}"`)
      .replace(enhancedImportPattern, `import { useAuth } from "${normalizedPath}"`);
    
    // Save file if changes were made
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Main function to find and fix files
function main() {
  // Find all TypeScript/TSX files
  const files = glob.sync('src/**/*.{ts,tsx}', { cwd: rootDir });
  
  let fixedCount = 0;
  
  for (const relativeFilePath of files) {
    const filePath = path.join(rootDir, relativeFilePath);
    
    if (fixImportsInFile(filePath)) {
      console.log(`Fixed imports in: ${relativeFilePath}`);
      fixedCount++;
    }
  }
  
  console.log(`\nFixed ${fixedCount} files in total.`);
}

main();
