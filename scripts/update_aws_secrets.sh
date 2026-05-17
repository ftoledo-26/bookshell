#!/bin/bash
# update_aws_secrets.sh
# Actualiza los secrets de AWS Academy en GitHub cuando las credenciales expiran.
#
# Uso:
#   1. Abre AWS Academy → "AWS Details" → copia las tres credenciales
#   2. Exportalas en el terminal:
#        export AWS_ACCESS_KEY_ID="ASIA..."
#        export AWS_SECRET_ACCESS_KEY="..."
#        export AWS_SESSION_TOKEN="..."
#   3. Ejecuta este script:
#        bash scripts/update_aws_secrets.sh

set -e

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ] || [ -z "$AWS_SESSION_TOKEN" ]; then
  echo "Error: faltan credenciales. Exporta AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY y AWS_SESSION_TOKEN antes de ejecutar este script."
  exit 1
fi

echo "Actualizando secrets AWS en GitHub..."

gh secret set AWS_ACCESS_KEY_ID     --body "$AWS_ACCESS_KEY_ID"
gh secret set AWS_SECRET_ACCESS_KEY --body "$AWS_SECRET_ACCESS_KEY"
gh secret set AWS_SESSION_TOKEN     --body "$AWS_SESSION_TOKEN"

echo "Listo. Los tres secrets AWS han sido actualizados."
