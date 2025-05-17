@echo off
cd d:\LUPUL\my-typescript-app
set TSC_COMPILE_ON_ERROR=true
echo Ignoring TypeScript errors and forcing the build...
call npm run build > build-log.txt 2>&1 || echo Build completed with errors but artifacts were generated
IF EXIST "dist" (
  echo Build artifacts were successfully generated in the dist folder
) ELSE (
  echo Failed to generate build artifacts
)
