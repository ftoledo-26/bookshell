# update-aws-secrets.ps1
# Actualiza los secretos AWS de GitHub con las credenciales actuales de AWS Academy.
#
# Uso:
#   .\update-aws-secrets.ps1
#   .\update-aws-secrets.ps1 -CredentialsFile "C:\Users\TuUsuario\Downloads\credentials"
#
# Requiere: gh CLI autenticado (winget install --id GitHub.cli)

param(
    [string]$CredentialsFile = "$env:USERPROFILE\.aws\credentials"
)

$Repo = "ftoledo-26/bookshell"

# --- Leer fichero de credenciales ---
if (-not (Test-Path $CredentialsFile)) {
    Write-Host ""
    Write-Host "No se encontro el fichero: $CredentialsFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pasos:" -ForegroundColor Yellow
    Write-Host "  1. En AWS Academy, pulsa 'AWS Details' -> 'Show'"
    Write-Host "  2. Pulsa 'Download' para bajar el fichero credentials"
    Write-Host "  3. Ejecuta: .\update-aws-secrets.ps1 -CredentialsFile 'C:\Users\TuUsuario\Downloads\credentials'"
    exit 1
}

$content = Get-Content $CredentialsFile -Raw

# --- Parsear los tres valores ---
$keyId      = if ($content -match 'aws_access_key_id\s*=\s*(\S+)')     { $Matches[1] } else { $null }
$secretKey  = if ($content -match 'aws_secret_access_key\s*=\s*(\S+)') { $Matches[1] } else { $null }
$sessionTok = if ($content -match 'aws_session_token\s*=\s*(\S+)')     { $Matches[1] } else { $null }

if (-not $keyId -or -not $secretKey -or -not $sessionTok) {
    Write-Host "El fichero no contiene los tres valores esperados." -ForegroundColor Red
    Write-Host "Asegurate de que incluye aws_access_key_id, aws_secret_access_key y aws_session_token."
    exit 1
}

Write-Host ""
Write-Host "Credenciales leidas:" -ForegroundColor Cyan
Write-Host "  aws_access_key_id     = $($keyId.Substring(0,8))..."
Write-Host "  aws_secret_access_key = $($secretKey.Substring(0,4))..."
Write-Host "  aws_session_token     = $($sessionTok.Substring(0,8))..."
Write-Host ""

# --- Actualizar secretos en GitHub ---
Write-Host "Actualizando secretos en $Repo ..." -ForegroundColor Yellow

$keyId      | gh secret set AWS_ACCESS_KEY_ID     --repo $Repo
$secretKey  | gh secret set AWS_SECRET_ACCESS_KEY --repo $Repo
$sessionTok | gh secret set AWS_SESSION_TOKEN     --repo $Repo

Write-Host ""
Write-Host "Secretos AWS actualizados correctamente." -ForegroundColor Green
Write-Host "Recuerda volver a ejecutar este script cuando el Lab caduque (~4h)."
