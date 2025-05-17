import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Fix imports for useAuth
async function fixImports() {
  // Find all TypeScript/TSX files that could import useAuth
  const files = await glob('src/**/*.{ts,tsx}', { cwd: rootDir, absolute: true });
  
  let fixedFilesCount = 0;

  for (const filePath of files) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files we've already fixed
    if (content.includes('import { useAuth } from "../contexts"') || 
        content.includes('import { useAuth } from "../../contexts"')) {
      continue;
    }
    
    // Fix imports from AuthContext
    const oldImport1 = /import\s*\{\s*useAuth\s*\}\s*from\s*["'](.+?)\/contexts\/AuthContext["']/g;
    const oldImport2 = /import\s*\{\s*useAuth\s*\}\s*from\s*["'](.+?)\/contexts\/EnhancedAuthContext(Provider)?["']/g;
    
    // Check if we need to replace anything
    if (oldImport1.test(content) || oldImport2.test(content)) {
      // Reset regexes since we used .test which moved the lastIndex
      oldImport1.lastIndex = 0;
      oldImport2.lastIndex = 0;
      
      // Calculate relative path to contexts
      const relativePath = path.relative(path.dirname(filePath), path.join(rootDir, 'src/contexts'));
      // Normalize path with forward slashes
      const normalizedPath = relativePath.split(path.sep).join('/');
      
      // Apply the replacements
      const newContent = content
        .replace(oldImport1, `import { useAuth } from "${normalizedPath}"`)
        .replace(oldImport2, `import { useAuth } from "${normalizedPath}"`);
      
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Fixed imports in: ${path.relative(rootDir, filePath)}`);
        fixedFilesCount++;
      }
    }
  }

  console.log(`\nFixed imports in ${fixedFilesCount} files.`);
}

// Fix problematic context files
function fixContextFiles() {
  // Create new fixed versions of the context files
  const cleanAuthContextContent = `// filepath: d:\\LUPUL\\my-typescript-app\\src\\contexts\\EnhancedAuthContext.tsx
// This file is a wrapper that provides enhanced auth functionality
import React from 'react';
import { AuthContext } from './AuthContextDef';
import { useAuth } from './useAuth';

// Re-export the useAuth hook for backward compatibility
export { useAuth };

// Dummy component to prevent import errors
export const AuthWrapper = () => <div>Auth Context Wrapper</div>;

export default AuthWrapper;
`;

  // Create fixed files
  fs.writeFileSync(
    path.join(rootDir, 'src/contexts/EnhancedAuthContext.tsx'),
    cleanAuthContextContent,
    'utf8'
  );
  
  // Remove any remaining provider file if it exists
  const providerPath = path.join(rootDir, 'src/contexts/EnhancedAuthContextProvider.tsx');
  if (fs.existsSync(providerPath)) {
    fs.unlinkSync(providerPath);
    console.log('Removed EnhancedAuthContextProvider.tsx');
  }
  
  // Make sure original AuthContext.tsx is fixed
  const authContextPath = path.join(rootDir, 'src/contexts/AuthContext.tsx');
  if (fs.existsSync(authContextPath)) {
    const fixedAuthContextContent = `// filepath: d:\\LUPUL\\my-typescript-app\\src\\contexts\\AuthContext.tsx
// This file is kept for backward compatibility
import { AuthContext } from './AuthContextDef';
import { useAuth } from './useAuth';

// Re-export the useAuth hook for backward compatibility
export { useAuth, AuthContext };
`;
    fs.writeFileSync(authContextPath, fixedAuthContextContent, 'utf8');
    console.log('Fixed AuthContext.tsx');
  }
  
  console.log('Context files have been fixed.');
}

// Main function
async function main() {
  try {
    console.log("Starting import fixes...");
    
    // Fix context files first
    fixContextFiles();
    
    // Fix imports in all files
    await fixImports();
    
    console.log("\nAll fixes completed successfully!");
  } catch (error) {
    console.error("Error during fix process:", error);
  }
}

// Run the main function
main();
