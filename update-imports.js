const fs = require('fs');
const path = require('path');

// Directory to search for files
const rootDir = './src';

// File extensions to process
const extensions = ['.ts', '.tsx'];

// Import replacements to make
const importReplacements = [
  {
    from: /import\s*\{\s*useAuth\s*\}\s*from\s*["'](.+?)\/contexts\/AuthContext["']/g,
    to: 'import { useAuth } from "$1/hooks/useAuth"'
  },
  {
    from: /import\s*\{\s*useCategories\s*\}\s*from\s*["'](.+?)\/contexts\/CategoryContext["']/g,
    to: 'import { useCategories } from "$1/hooks/useCategories"'
  },
  {
    from: /import\s*\{\s*useNavigation\s*\}\s*from\s*["'](.+?)\/contexts\/NavigationContext["']/g,
    to: 'import { useNavigation } from "$1/hooks/useNavigation"'
  },
  {
    from: /import\s*\{\s*useTheme\s*\}\s*from\s*["'](.+?)\/contexts\/ThemeContext["']/g,
    to: 'import { useTheme } from "$1/hooks/useTheme"'
  }
];

// Function to recursively find files
function findFiles(dir, extensions, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findFiles(filePath, extensions, fileList);
    } else if (extensions.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to update imports in a file
function updateImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    importReplacements.forEach(({ from, to }) => {
      const newContent = content.replace(from, to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

// Find and process all files
const files = findFiles(rootDir, extensions);
console.log(`Found ${files.length} files to process`);
files.forEach(updateImports);
console.log('Import update complete!');
