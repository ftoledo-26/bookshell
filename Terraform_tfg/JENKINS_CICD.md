# Jenkins CI/CD simple (TFG DAW)

Objetivo:
- Un solo repo GitHub con dos ramas: `Front` y `Back`.
- Sin Terraform en pipeline.
- Sin AWS CLI ni claves AWS.
- Solo SSH (via bastion) + git pull/reset en servidores.
- El frontend y el backend usan el mismo `origin` (mismo repo), cambiando solo la rama.

## 1) Requisitos en servidores (una sola vez)

En frontend (via bastion):
```bash
REPO_URL="https://github.com/ftoledo-26/bookshell.git"
cd /var/www
sudo git clone "$REPO_URL" front
cd /var/www/front
sudo git fetch origin
sudo git checkout -B Front origin/Front
```

En backend (via bastion):
```bash
REPO_URL="https://github.com/ftoledo-26/bookshell.git"
cd /var/www
sudo git clone "$REPO_URL" back
cd /var/www/back
sudo git fetch origin
sudo git checkout -B Back origin/Back
```

## 2) Credencial SSH en Jenkins

1. Abre Jenkins en el navegador.
2. Ve a `Manage Jenkins` -> `Credentials`.
3. En `System` -> `Global credentials`, pulsa `Add Credentials`.
4. Tipo: `SSH Username with private key`.
5. Username: `ubuntu`.
6. Private Key: `Enter directly` y pega el contenido del .pem.
7. ID: `bookshell-ssh`.
8. Save.

## 3) Crear job multibranch

1. `New Item`.
2. Nombre: `bookshell-multibranch`.
3. Tipo: `Multibranch Pipeline`.
4. En `Branch Sources` elige `GitHub` o `Git`.
5. Repo: `https://github.com/ftoledo-26/bookshell.git`.
6. Credencial GitHub si el repo es privado.
7. `Build Configuration` -> `by Jenkinsfile`.
8. Script Path: `Terraform_tfg/Jenkinsfile` (o `Jenkinsfile` si lo mueves a raiz).
9. Save.

## 4) Webhook GitHub -> Jenkins

En GitHub:
1. Repo -> `Settings` -> `Webhooks` -> `Add webhook`.
2. Payload URL: `http://TU_JENKINS/github-webhook/`.
3. Content type: `application/json`.
4. Events: `Just the push event`.
5. Activo y guardar.

En Jenkins:
- En el multibranch, habilita scan por webhook (normalmente ya lo recibe con github-webhook).

## 5) ProxyJump (bastion)

El `Jenkinsfile` usa este patron:
```bash
ssh -i "$SSH_KEY" -J ubuntu@BASTION_PUBLIC_IP ubuntu@PRIVATE_IP
```

Eso significa:
- Jenkins entra al bastion.
- Desde bastion salta a la IP privada de Front o Back.
- No abres SSH publico en Front/Back.

## 6) Flujo real por rama

### Si haces push a `Front`
Pipeline ejecuta:
```bash
cd /var/www/front
git fetch origin Front
git checkout Front || git checkout -b Front origin/Front
git reset --hard origin/Front
npm install
npm run build -- --configuration production
sudo rm -rf /var/www/html/*
sudo cp -r dist/*/* /var/www/html/
sudo systemctl reload apache2
```

### Si haces push a `Back`
Pipeline ejecuta:
```bash
cd /var/www/back
git fetch origin Back
git checkout Back || git checkout -b Back origin/Back
git reset --hard origin/Back
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
sudo chown -R www-data:www-data /var/www/back
sudo systemctl reload apache2
```

## 7) Variables a cambiar en Jenkinsfile

Edita estos valores:
- `BASTION_HOST`
- `FRONT_HOST`
- `BACK_HOST`
- rutas `FRONT_APP_DIR` y `BACK_APP_DIR` si cambian
- `SSH_CRED_ID` (si usas otro ID)

Tu dominio DuckDNS puede seguir apuntando al frontend EIP:
- `bookshell.duckdns.org -> 79.145.87.177`

## 8) Defensa TFG (mensaje corto)

"El CI/CD es simple y funcional: Jenkins multibranch detecta cambios en Front y Back dentro del mismo repositorio. El despliegue se realiza por SSH, pasando por bastion con ProxyJump, sin Terraform ni AWS CLI en pipeline. En cada servidor se actualiza la rama correspondiente y se ejecutan comandos de build/deploy reales del stack."
