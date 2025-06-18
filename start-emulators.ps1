# Script PowerShell pentru pornirea emulatorilor Firebase
Write-Host "Pornesc emulatoarele Firebase..." -ForegroundColor Green

# Navighez în directorul proiectului
Set-Location "d:\LUPUL\my-typescript-app"

# Opresc orice procese Java existente
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force

# Aștept puțin
Start-Sleep -Seconds 2

# Pornesc emulatoarele
try {
    Write-Host "Pornesc Firestore emulator pe portul 8080..." -ForegroundColor Yellow
    Start-Process -FilePath "firebase" -ArgumentList "emulators:start", "--only", "firestore", "--project", "demo-test" -NoNewWindow
    
    Start-Sleep -Seconds 5
    
    Write-Host "Verific statusul..." -ForegroundColor Yellow
    netstat -an | findstr "8080"
    
    Write-Host "Emulatori porniți cu succes!" -ForegroundColor Green
    Write-Host "Firestore UI: http://127.0.0.1:4000/firestore" -ForegroundColor Cyan
} catch {
    Write-Host "Eroare la pornirea emulatorilor: $_" -ForegroundColor Red
}
