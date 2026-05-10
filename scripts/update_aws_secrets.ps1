# update_aws_secrets.ps1
# Actualiza los secrets de AWS Academy en GitHub cuando las credenciales expiran.
#
# Uso:
#   1. Abre AWS Academy → "AWS Details" → copia las tres credenciales
#   2. Pegalas como variables de entorno:
#        $env:AWS_ACCESS_KEY_ID     = "ASIA..."
#        $env:AWS_SECRET_ACCESS_KEY = "..."
#        $env:AWS_SESSION_TOKEN     = "..."
#   3. Ejecuta este script:
#        .\scripts\update_aws_secrets.ps1

param(
    [string]$KeyId       = $env:AWS_ACCESS_KEY_ID,
    [string]$SecretKey   = $env:AWS_SECRET_ACCESS_KEY,
    [string]$SessionToken = $env:AWS_SESSION_TOKEN
)

if (-not $KeyId -or -not $SecretKey -or -not $SessionToken) {
    Write-Error "Faltan credenciales. Asegurate de tener AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY y AWS_SESSION_TOKEN en el entorno."
    exit 1
}

Write-Host "Actualizando secrets AWS en GitHub..."

gh secret set AWS_ACCESS_KEY_ID     --body $KeyId
gh secret set AWS_SECRET_ACCESS_KEY --body $SecretKey
gh secret set AWS_SESSION_TOKEN     --body $SessionToken

Write-Host "Listo. Los tres secrets AWS han sido actualizados."
