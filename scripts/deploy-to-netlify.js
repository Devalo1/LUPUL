// Script to deploy the application to Netlify
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Ensure we're in the project root
const projectRoot = path.resolve(process.cwd());
console.log(`Project root: ${projectRoot}`);

// Function to run a command and log output
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    const output = execSync(command, { 
      cwd: projectRoot,
      stdio: 'inherit',
      env: { ...process.env, TSC_COMPILE_ON_ERROR: 'true' }
    });
    return output;
  } catch (error) {
    console.error(`Command failed: ${error.message}`);
    if (error.stdout) console.log(`stdout: ${error.stdout.toString()}`);
    if (error.stderr) console.error(`stderr: ${error.stderr.toString()}`);
    throw error;
  }
}

async function deploy() {
  try {
    console.log('🚀 Starting Netlify deployment process...');
    
    // 1. Make sure we're on the deploy-netlify branch
    console.log('Checking current git branch...');
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    
    if (currentBranch !== 'deploy-netlify') {
      console.error('❌ Not on deploy-netlify branch. Please checkout deploy-netlify branch first.');
      process.exit(1);
    }
    
    // 2. Run the build with TypeScript errors ignored
    console.log('Building project with TypeScript errors ignored...');
    runCommand('cross-env TSC_COMPILE_ON_ERROR=true npm run build');
    
    // 3. Check if dist folder was created
    if (!fs.existsSync(path.join(projectRoot, 'dist'))) {
      console.error('❌ Build failed: dist folder not created');
      process.exit(1);
    }
    
    // 4. Deploy to Netlify
    console.log('Deploying to Netlify...');
    runCommand('netlify deploy --prod');
    
    console.log('✅ Deployment process completed!');
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

deploy();
