# Script pentru compilarea funcțiilor și lansarea aplicației cu emulatorii în PowerShell
# Acest script rezolvă problema comenzilor compuse din PowerShell

# Compilează funcțiile
Write-Host "Compilarea funcțiilor Firebase..." -ForegroundColor Cyan
Set-Location -Path "D:\LUPUL\my-typescript-app\functions"
npm run build

# Revine la directorul principal
Set-Location -Path "D:\LUPUL\my-typescript-app"

# Verifică dacă compilarea a avut succes
if ($LASTEXITCODE -eq 0) {
    Write-Host "Compilare terminată cu succes. Pornire aplicație cu emulatorii..." -ForegroundColor Green
    
    # Oferă opțiunea de a porni emulatorii optimizați sau toți emulatorii
    $choice = Read-Host "Dorești să pornești (1) toți emulatorii sau (2) doar emulatorii optimizați? (1/2)"
    
    if ($choice -eq "2") {
        Write-Host "Pornire aplicație cu emulatorii optimizați..." -ForegroundColor Cyan
        Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow
        
        # Așteaptă puțin să pornească aplicația
        Start-Sleep -Seconds 2
        
        # Pornește emulatorii optimizați
        npm run emulators:optimized
    }
    else {
        Write-Host "Pornire aplicație cu toți emulatorii..." -ForegroundColor Cyan
        Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run dev:all" -NoNewWindow
    }
}
else {
    Write-Host "Compilarea a eșuat. Verifică erorile de mai sus." -ForegroundColor Red
}