# Script pentru resetarea completă a configurației
# Folosește acest script dacă vrei să resetezi totul la starea inițială

param(
    [switch]$Force = $false
)

Write-Host "🔄 SCRIPT RESETARE CONFIGURAȚIE" -ForegroundColor Red
Write-Host "===============================" -ForegroundColor Red

if (-not $Force) {
    Write-Host "`n⚠️  ATENȚIE: Acest script va reseta toate modificările!" -ForegroundColor Yellow
    Write-Host "Pentru a proceda, rulează din nou cu parametrul -Force:" -ForegroundColor Yellow
    Write-Host "   .\reset-configuration.ps1 -Force" -ForegroundColor Cyan
    return
}

Write-Host "`n🗑️  Resetez configurația..." -ForegroundColor Yellow

# Lista fișierelor de backup
$backupFiles = @(
    "netlify\functions\netopia-initiate.js.backup",
    "netlify\functions\send-order-email.js.backup", 
    "netlify\functions\process-payment-completion.js.backup",
    "netlify\functions\netopia-notify.js.backup",
    "src\services\netopiaPayments.ts.backup"
)

$restored = 0
$failed = 0

foreach ($backupFile in $backupFiles) {
    $originalFile = $backupFile -replace '\.backup$', ''
    
    if (Test-Path $backupFile) {
        try {
            Copy-Item -Path $backupFile -Destination $originalFile -Force
            Write-Host "✅ Restaurat: $originalFile" -ForegroundColor Green
            $restored++
        } catch {
            Write-Host "❌ Eroare la restaurare: $originalFile" -ForegroundColor Red
            Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
            $failed++
        }
    } else {
        Write-Host "⚠️  Backup lipsă: $backupFile" -ForegroundColor Yellow
    }
}

# Șterge fișierele de documentație create
$docsToRemove = @(
    "NETOPIA_COMPLIANCE_FINAL_REPORT.md",
    "NETOPIA_DEBUG_FINAL_REPORT.md", 
    "NETLIFY_ENVIRONMENT_SETUP.md",
    "setup-netlify-vars.js",
    "test-production.ps1",
    "reset-configuration.ps1"
)

foreach ($doc in $docsToRemove) {
    if (Test-Path $doc) {
        try {
            Remove-Item -Path $doc -Force
            Write-Host "🗑️  Șters: $doc" -ForegroundColor Yellow
        } catch {
            Write-Host "⚠️  Nu s-a putut șterge: $doc" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n📊 RAPORT RESETARE:" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host "✅ Fișiere restaurate: $restored" -ForegroundColor Green
Write-Host "❌ Eșecuri: $failed" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host "`n🎉 RESETARE COMPLETĂ CU SUCCES!" -ForegroundColor Green
    Write-Host "Toate fișierele au fost restaurate la starea inițială." -ForegroundColor Green
} else {
    Write-Host "`n⚠️  RESETARE PARȚIALĂ" -ForegroundColor Yellow
    Write-Host "Verifică manual fișierele care au eșuat." -ForegroundColor Yellow
}

Write-Host "`n🔄 Pentru a reaplica fix-urile, rulează din nou scriptul principal." -ForegroundColor Cyan
