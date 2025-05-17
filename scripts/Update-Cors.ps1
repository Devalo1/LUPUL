# PowerShell script to update CORS settings for Firebase Storage
# This script works in Windows PowerShell environment

# Path to the CORS configuration file
$corsFilePath = Join-Path $PSScriptRoot "..\cors.json"

# Display current CORS settings
function Show-CurrentCorsSettings {
    try {
        $corsConfig = Get-Content -Path $corsFilePath -Raw | ConvertFrom-Json
        Write-Host "Configurația CORS curentă:"
        Write-Host ($corsConfig | ConvertTo-Json -Depth 4)
    }
    catch {
        Write-Error "Nu s-a putut citi configurația CORS din $corsFilePath : $_"
        exit 1
    }
}

# Update CORS settings
function Update-CorsSettings {
    Write-Host "Actualizare configurație CORS pentru Firebase Storage..."
    
    try {
        # Check if CORS file exists, create it if not
        if (-not (Test-Path $corsFilePath)) {
            Write-Error "Fișierul de configurare CORS nu a fost găsit la $corsFilePath"
            Write-Host "Se creează un fișier de configurare CORS implicit..."
            
            $defaultCorsConfig = @(
                @{
                    origin = @("http://localhost:3000", "https://lupulcorbul.web.app", "*")
                    method = @("GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS")
                    responseHeader = @(
                        "Content-Type"
                        "Content-Length"
                        "Access-Control-Allow-Origin"
                        "Access-Control-Allow-Methods"
                        "Access-Control-Allow-Headers"
                        "Access-Control-Expose-Headers"
                        "Access-Control-Allow-Credentials"
                        "Authorization"
                        "X-Requested-With"
                        "Accept"
                        "Content-Disposition"
                        "Cache-Control"
                        "ETag"
                    )
                    maxAgeSeconds = 3600
                }
            )
            
            $defaultCorsConfig | ConvertTo-Json -Depth 4 | Out-File -FilePath $corsFilePath -Encoding utf8
            Write-Host "Fișier de configurare CORS implicit creat la $corsFilePath"
        }
        
        # Get Firebase project details
        $firebaseRcPath = Join-Path $PSScriptRoot "..\.firebaserc"
        $storageBucket = "lupulcorbul.appspot.com"  # Default value
        
        if (Test-Path $firebaseRcPath) {
            $firebaseRc = Get-Content -Path $firebaseRcPath -Raw | ConvertFrom-Json
            if ($firebaseRc.projects.default) {
                $storageBucket = "$($firebaseRc.projects.default).appspot.com"
            }
        }
        
        # Check if gsutil is installed
        $gsutilInstalled = $false
        try {
            $null = & gsutil --version
            $gsutilInstalled = $true
        }
        catch {
            Write-Error "gsutil nu este instalat sau nu este disponibil în PATH."
            Write-Host "Te rog instalează Google Cloud SDK de la https://cloud.google.com/sdk/docs/install"
        }
        
        if ($gsutilInstalled) {
            Write-Host "Se aplică configurația CORS la bucket-ul gs://$storageBucket..."
            & gsutil cors set $corsFilePath gs://$storageBucket
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Configurația CORS a fost actualizată cu succes!"
                Write-Host "Bucket: gs://$storageBucket"
                Write-Host "Configurație: $corsFilePath"
            }
            else {
                Write-Error "Eroare la actualizarea configurației CORS. Cod de ieșire: $LASTEXITCODE"
            }
        }
        
        # Always provide manual instructions
        Write-Host "`nInstrucțiuni pentru actualizarea manuală a configurației CORS:"
        Write-Host "1. Accesează https://console.firebase.google.com/"
        Write-Host "2. Selectează proiectul tău"
        Write-Host "3. Navigă la Storage -> Rules"
        Write-Host "4. Adaugă următoarea configurație CORS:"
        Get-Content -Path $corsFilePath
        
        Write-Host "`nSau rulează următoarea comandă în Google Cloud Shell:"
        Write-Host "gsutil cors set $corsFilePath gs://$storageBucket"
    }
    catch {
        Write-Error "Eroare la actualizarea configurației CORS: $_"
        exit 1
    }
}

# Process command-line arguments
if ($args -contains "--show") {
    Show-CurrentCorsSettings
}
else {
    Update-CorsSettings
}