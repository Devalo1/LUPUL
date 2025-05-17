/**
 * Component Documentation Generator
 * 
 * This script analyzes React components and generates documentation
 * based on TypeScript types, JSDoc comments, and PropTypes.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const ts = require('typescript');
const doctrine = require('doctrine');

// Configuration
const CONFIG = {
  componentsDir: path.join(__dirname, '../src/components'),
  outputDir: path.join(__dirname, '../docs/components'),
  componentsGlob: '**/*.{jsx,tsx}',
  excludeDirs: ['__tests__', '__mocks__', 'deprecated'],
  markdownTemplate: 'templates/component.md',
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

// Helper function to extract JSDoc comments
function extractJSDocComment(node) {
  const commentRanges = ts.getLeadingCommentRanges(
    node.getFullText(),
    0
  );
  
  if (!commentRanges || commentRanges.length === 0) {
    return null;
  }
  
  const commentRange = commentRanges[commentRanges.length - 1];
  const comment = node.getFullText().slice(
    commentRange.pos,
    commentRange.end
  );
  
  return comment;
}

// Helper function to parse JSDoc comments
function parseJSDocComment(comment) {
  if (!comment) return null;
  
  try {
    return doctrine.parse(comment, { unwrap: true });
  } catch (e) {
    console.error('Error parsing JSDoc comment:', e);
    return null;
  }
}

// Main function to process a component file
function processComponentFile(filePath) {
  console.log(`Processing component: ${filePath}`);
  
  // Read the file content
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Parse the file with TypeScript
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );
  
  // Extract component information
  const componentInfo = {
    name: path.basename(filePath, path.extname(filePath)),
    description: '',
    props: [],
    filePath: path.relative(process.cwd(), filePath),
  };
  
  // Walk through the AST to find component info
  function visit(node) {
    // Look for exported function or class components
    if (
      (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) &&
      node.modifiers &&
      node.modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      // Get component name
      if (node.name) {
        componentInfo.name = node.name.text;
      }
      
      // Extract JSDoc comment
      const jsDocComment = extractJSDocComment(node);
      const parsedComment = parseJSDocComment(jsDocComment);
      
      if (parsedComment) {
        componentInfo.description = parsedComment.description || '';
        
        // Extract tags (e.g., @example, @deprecated)
        parsedComment.tags.forEach(tag => {
          if (tag.title === 'example') {
            componentInfo.example = tag.description;
          } else if (tag.title === 'deprecated') {
            componentInfo.deprecated = tag.description || true;
          }
        });
      }
    }
    
    // Look for interface or type declaration for props
    if (
      (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
      node.name.text.includes('Props')
    ) {
      // Extract prop definitions from interface
      if (ts.isInterfaceDeclaration(node)) {
        node.members.forEach(member => {
          if (ts.isPropertySignature(member)) {
            const propName = member.name.getText(sourceFile);
            const isOptional = member.questionToken ? true : false;
            const typeText = member.type ? member.type.getText(sourceFile) : 'any';
            
            // Extract JSDoc comment for this prop
            const jsDocComment = extractJSDocComment(member);
            const parsedComment = parseJSDocComment(jsDocComment);
            
            const propInfo = {
              name: propName,
              type: typeText,
              required: !isOptional,
              description: parsedComment ? parsedComment.description : '',
              defaultValue: '',
            };
            
            componentInfo.props.push(propInfo);
          }
        });
      }
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  
  // Generate markdown documentation
  generateMarkdownDoc(componentInfo);
  
  return componentInfo;
}

// Function to generate markdown documentation
function generateMarkdownDoc(componentInfo) {
  const outputPath = path.join(CONFIG.outputDir, `${componentInfo.name}.md`);
  
  // Create markdown content
  let markdown = `# ${componentInfo.name}\n\n`;
  
  if (componentInfo.description) {
    markdown += `${componentInfo.description}\n\n`;
  }
  
  if (componentInfo.deprecated) {
    const deprecatedMsg = typeof componentInfo.deprecated === 'string' 
      ? componentInfo.deprecated 
      : 'This component is deprecated and will be removed in a future version.';
    
    markdown += `> **Deprecated:** ${deprecatedMsg}\n\n`;
  }
  
  markdown += `File: \`${componentInfo.filePath}\`\n\n`;
  
  // Add props table
  if (componentInfo.props.length > 0) {
    markdown += `## Props\n\n`;
    markdown += `| Name | Type | Required | Description | Default |\n`;
    markdown += `|------|------|----------|-------------|---------|\n`;
    
    componentInfo.props.forEach(prop => {
      markdown += `| ${prop.name} | \`${prop.type}\` | ${prop.required ? 'Yes' : 'No'} | ${prop.description || ''} | ${prop.defaultValue || '-'} |\n`;
    });
    
    markdown += '\n';
  }
  
  // Add examples if available
  if (componentInfo.example) {
    markdown += `## Example\n\n`;
    markdown += '```jsx\n';
    markdown += componentInfo.example;
    markdown += '\n```\n';
  }
  
  // Write the markdown file
  fs.writeFileSync(outputPath, markdown);
  console.log(`Generated documentation: ${outputPath}`);
}

// Find all component files and process them
function processAllComponents() {
  const componentsPattern = path.join(CONFIG.componentsDir, CONFIG.componentsGlob);
  
  // Find component files
  const componentFiles = glob.sync(componentsPattern, {
    ignore: CONFIG.excludeDirs.map(dir => path.join(CONFIG.componentsDir, dir, '**'))
  });
  
  console.log(`Found ${componentFiles.length} component files`);
  
  // Process each component file
  const componentsInfo = componentFiles.map(processComponentFile);
  
  // Generate index file
  generateIndexFile(componentsInfo);
  
  console.log('Component documentation generation completed!');
}

// Generate an index file with links to all components
function generateIndexFile(componentsInfo) {
  const indexPath = path.join(CONFIG.outputDir, 'README.md');
  
  let markdown = `# Component Documentation\n\n`;
  markdown += `This directory contains documentation for ${componentsInfo.length} React components.\n\n`;
  
  // Group components by directory
  const componentsByDir = {};
  
  componentsInfo.forEach(component => {
    const dirPath = path.dirname(component.filePath);
    const relativePath = path.relative(path.join(process.cwd(), 'src/components'), dirPath);
    
    const category = relativePath === '' ? 'Root' : relativePath;
    
    if (!componentsByDir[category]) {
      componentsByDir[category] = [];
    }
    
    componentsByDir[category].push(component);
  });
  
  // Generate links by category
  Object.keys(componentsByDir).sort().forEach(category => {
    markdown += `## ${category}\n\n`;
    
    componentsByDir[category]
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(component => {
        const link = `${component.name}.md`;
        let componentLine = `- [${component.name}](${link})`;
        
        if (component.description) {
          // Add a short description (first line or first 100 chars)
          const shortDesc = component.description
            .split('\n')[0]
            .substring(0, 100)
            .trim();
            
          componentLine += ` - ${shortDesc}`;
          if (component.description.length > 100) componentLine += '...';
        }
        
        if (component.deprecated) {
          componentLine += ' **(Deprecated)**';
        }
        
        markdown += `${componentLine}\n`;
      });
    
    markdown += '\n';
  });
  
  // Write the index file
  fs.writeFileSync(indexPath, markdown);
  console.log(`Generated index file: ${indexPath}`);
}

// Execute the script
processAllComponents();
