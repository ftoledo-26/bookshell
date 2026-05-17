# update-aws-secrets.ps1
# Actualiza los secretos AWS de GitHub con las credenciales actuales de AWS Academy.
#
# Modos de uso:
#   1. Desde portapapeles (copia el bloque [default]... y ejecuta):
#        .\update-aws-secrets.ps1 -Clipboard
#
#   2. Desde fichero descargado:
#        .\update-aws-secrets.ps1 -CredentialsFile "C:\Users\TuUsuario\Downloads\credentials"
#
#   3. Sin parametros: busca en ~/.aws/credentials
#        .\update-aws-secrets.ps1
#
# Requiere: gh CLI autenticado (winget install --id GitHub.cli)

param(
    [switch]$Clipboard,
    [string]$CredentialsFile = "$env:USERPROFILE\.aws\credentials"
)

$Repo = "ftoledo-26/bookshell"

# --- Obtener el texto de credenciales ---
if ($Clipboard) {
    $content = Get-Clipboard -Raw
    if (-not $content) {
        Write-Host "El portapapeles esta vacio. Copia primero el bloque [default]..." -ForegroundColor Red
        exit 1
    }
    Write-Host "Leyendo credenciales del portapapeles..." -ForegroundColor Cyan
} elseif (Test-Path $CredentialsFile) {
    $content = Get-Content $CredentialsFile -Raw
    Write-Host "Leyendo credenciales de: $CredentialsFile" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "No se encontro el fichero de credenciales." -ForegroundColor Red
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "  1. Copia el bloque [default]... de AWS Academy y ejecuta:"
    Write-Host "       .\update-aws-secrets.ps1 -Clipboard"
    Write-Host ""
    Write-Host "  2. O pasa la ruta del fichero descargado:"
    Write-Host "       .\update-aws-secrets.ps1 -CredentialsFile 'C:\Users\TuUsuario\Downloads\credentials'"
    exit 1
}

# --- Parsear los tres valores ---
$keyId      = if ($content -match 'aws_access_key_id\s*=\s*(\S+)')     { $Matches[1] } else { $null }
$secretKey  = if ($content -match 'aws_secret_access_key\s*=\s*(\S+)') { $Matches[1] } else { $null }
$sessionTok = if ($content -match 'aws_session_token\s*=\s*(\S+)')     { $Matches[1] } else { $null }

if (-not $keyId -or -not $secretKey -or -not $sessionTok) {
    Write-Host "No se encontraron los tres valores esperados en el texto." -ForegroundColor Red
    Write-Host "Asegurate de que incluye aws_access_key_id, aws_secret_access_key y aws_session_token."
    exit 1
}

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
