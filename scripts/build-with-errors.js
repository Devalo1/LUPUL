// Bypass script for production build
// This script will run the build with TSC_COMPILE_ON_ERROR=true to allow the build to complete
// even with TypeScript errors. This is useful for fixing Firebase integration issues.
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const buildCommand = 'cross-env TSC_COMPILE_ON_ERROR=true npm run build';

console.log('Running production build with error ignoring enabled...');
console.log(`Executing: ${buildCommand}`);

exec(buildCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Build failed with error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Build warnings/errors: ${stderr}`);
  }
  
  console.log(`Build output: ${stdout}`);
  console.log('Build completed with errors ignored.');
});
