# Script pentru adaugarea variabilelor NETOPIA Live multi-line
Write-Host "Adaugare NETOPIA_LIVE_PRIVATE_KEY..." -ForegroundColor Cyan

# Read content and encode as base64 to handle multi-line
$privateKeyContent = Get-Content -Path "temp_private_key.txt" -Raw
$privateKeyEncoded = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($privateKeyContent))

# Set using base64 encoding then decode on server side
netlify env:set NETOPIA_LIVE_PRIVATE_KEY_B64 $privateKeyEncoded

Write-Host "Adaugare NETOPIA_LIVE_CERTIFICATE..." -ForegroundColor Cyan

$certificateContent = Get-Content -Path "temp_certificate.txt" -Raw  
$certificateEncoded = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($certificateContent))

netlify env:set NETOPIA_LIVE_CERTIFICATE_B64 $certificateEncoded

Write-Host "Variabile multi-line adaugate ca Base64 encoded!" -ForegroundColor Green
Write-Host "NETOPIA_LIVE_PRIVATE_KEY_B64 si NETOPIA_LIVE_CERTIFICATE_B64 setate" -ForegroundColor Yellow
