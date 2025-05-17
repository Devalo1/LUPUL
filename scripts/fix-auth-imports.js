const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Get all TypeScript and TSX files in the project
const files = glob.sync('src/**/*.{ts,tsx}', { cwd: process.cwd() });

// Function to update imports in a file
function updateImportsInFile(filePath) {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files that don't import useAuth
    if (!content.includes('useAuth') || !content.includes('from')) {
      return false;
    }

    // Replace imports from AuthContext with imports from the contexts index
    let newContent = content
      // Replace imports directly from AuthContext
      .replace(
        /import\s*{\s*useAuth\s*}\s*from\s*['"](.+?)\/contexts\/AuthContext['"];?/g,
        'import { useAuth } from "$1/contexts";'
      )
      // Replace relative imports
      .replace(
        /import\s*{\s*useAuth\s*}\s*from\s*['"](\.\.\/)+contexts\/AuthContext['"];?/g,
        'import { useAuth } from "$1contexts";'
      );

    // Only write to the file if changes were made
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated imports in ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Process all files
let updatedCount = 0;
for (const file of files) {
  if (updateImportsInFile(file)) {
    updatedCount++;
  }
}

console.log(`Updated ${updatedCount} files`);
