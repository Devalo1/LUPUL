# Git Optimization Script
# Updated: May 17, 2025
# Description: Optimizes Git repository for TypeScript projects

Write-Host "Starting Git optimization for TypeScript project..." -ForegroundColor Green

# 1. Check if index.lock file exists and remove it to prevent Git blocking
$indexLockPath = ".git\index.lock"
if (Test-Path $indexLockPath) {
    Write-Host "Removing index.lock file that's blocking Git operations..." -ForegroundColor Yellow
    Remove-Item -Force $indexLockPath
}

# 2. Configure Git parameters for improved performance
Write-Host "Configuring Git parameters for improved performance..." -ForegroundColor Yellow
git config --local core.compression 0
git config --local core.bigFileThreshold 10m
git config --local pack.windowMemory "100m"
git config --local pack.packSizeLimit "100m"
git config --local pack.threads "1"
git config --local core.preloadIndex true
git config --local core.autocrlf true # Handle line endings correctly

# 3. Prompt for Git user information if not already configured
$userEmail = git config --get user.email
$userName = git config --get user.name

if (-not $userEmail -or -not $userName) {
    Write-Host "Git user information not fully configured." -ForegroundColor Yellow
    
    if (-not $userEmail) {
        $userEmail = Read-Host "Please enter your Git email"
        git config --local user.email $userEmail
    }
    
    if (-not $userName) {
        $userName = Read-Host "Please enter your Git username"
        git config --local user.name $userName
    }
    
    Write-Host "Git user information configured." -ForegroundColor Green
} else {
    Write-Host "Git user information already configured:" -ForegroundColor Green
    Write-Host "Email: $userEmail" -ForegroundColor Cyan
    Write-Host "Name: $userName" -ForegroundColor Cyan
}

# 4. Check if .gitignore is properly configured
Write-Host "Verifying if node_modules and dist are correctly ignored..." -ForegroundColor Yellow

# Check if .gitignore exists
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content .gitignore
    
    # Check for node_modules ignoring patterns
    $hasNodeModules = $gitignoreContent | Where-Object { $_ -match "node_modules" }
    if (-not $hasNodeModules) {
        Write-Host "Adding node_modules to .gitignore..." -ForegroundColor Yellow
        Add-Content -Path .gitignore -Value "`n# Node.js dependencies`nnode_modules/`n/node_modules`n**/node_modules`n"
    } else {
        Write-Host "node_modules is already in .gitignore." -ForegroundColor Green
    }
    
    # Check for dist ignoring patterns
    $hasDist = $gitignoreContent | Where-Object { $_ -match "dist" }
    if (-not $hasDist) {
        Write-Host "Adding dist to .gitignore..." -ForegroundColor Yellow
        Add-Content -Path .gitignore -Value "`n# Build output`ndist/`n/dist`n**/dist`n"
    } else {
        Write-Host "dist is already in .gitignore." -ForegroundColor Green
    }
} else {
    Write-Host "Creating .gitignore file..." -ForegroundColor Yellow
    @"
# Dependencies
node_modules/
/node_modules
**/node_modules

# Build output
dist/
/dist
**/dist

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.idea/
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
"@ | Out-File -FilePath ".gitignore" -Encoding utf8
    Write-Host ".gitignore file created." -ForegroundColor Green
}

# 5. Repository cleanup and optimization
Write-Host "`nBeginning repository cleanup and optimization..." -ForegroundColor Green

# 5.1 Clean up ignored files from Git index if they're being tracked
$promptForCleanup = Read-Host "Do you want to check for and remove any tracked files that should be ignored? (y/n)"
if ($promptForCleanup -eq "y") {
    Write-Host "Checking for tracked files that should be ignored..." -ForegroundColor Yellow
    
    # First check if there are any tracked files that should be ignored
    $trackedIgnored = git ls-files -i --exclude-standard
    
    if ($trackedIgnored) {
        Write-Host "The following ignored files are currently tracked:" -ForegroundColor Yellow
        Write-Host $trackedIgnored -ForegroundColor Red
        
        $confirmRemoval = Read-Host "Do you want to remove these files from Git tracking? (y/n)"
        if ($confirmRemoval -eq "y") {
            Write-Host "Removing ignored files from Git tracking..." -ForegroundColor Yellow
            git rm -r --cached .
            git add .
            git commit -m "Remove ignored files from Git tracking"
            Write-Host "Ignored files have been removed from Git tracking." -ForegroundColor Green
        }
    } else {
        Write-Host "No ignored files are being tracked. Great!" -ForegroundColor Green
    }
}

# 5.2 Run Git garbage collection and optimization
Write-Host "`nRunning Git garbage collection and optimization..." -ForegroundColor Yellow
git gc --aggressive --prune=now
Write-Host "Garbage collection complete." -ForegroundColor Green

# 5.3 Clean up redundant or unused Git objects
Write-Host "`nCleaning up unreferenced objects..." -ForegroundColor Yellow
git prune
Write-Host "Unreferenced objects cleaned up." -ForegroundColor Green

# 5.4 Repack the repository
Write-Host "`nRepacking the repository..." -ForegroundColor Yellow
git repack -a -d --depth=250 --window=250
Write-Host "Repository repacked." -ForegroundColor Green

# 5.5 Check repository size
$repoSize = git count-objects -v
Write-Host "`nRepository size information:" -ForegroundColor Cyan
Write-Host $repoSize

# 6. Final status report
Write-Host "`nGit optimization process complete!" -ForegroundColor Green
Write-Host "You can view the current Git status with: git status" -ForegroundColor Cyan
Write-Host "Remember to periodically run this script to keep your repository optimized." -ForegroundColor Cyan

# 7. Optionally open Git setup documentation
$openDocs = Read-Host "`nDo you want to open the Git setup documentation? (y/n)"
if ($openDocs -eq "y") {
    if (Test-Path "docs/git-setup.md") {
        Write-Host "Opening Git setup documentation..." -ForegroundColor Yellow
        Invoke-Item "docs/git-setup.md"
    } else {
        Write-Host "Git setup documentation not found at docs/git-setup.md" -ForegroundColor Red
    }
}
