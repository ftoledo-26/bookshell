# Bookshell — Despliegue AWS con Terraform

## Arquitectura

```
Internet
   |
   |-- HTTPS/HTTP --> [ ALB bookshell-alb ]
   |                          |
   |                          v
   |-- HTTPS/HTTP --> [ EC2 Frontend (Angular + Apache) ]  <-- SSH via bastion
   |                          | ProxyPass /api
   |                          v
   |                   [ EC2 Backend (Laravel) ]            <-- SSH via bastion
   |                          | MySQL 3306
   |                          v
   |                   [ RDS MySQL 8.0 (bookshell-db) ]
   |
   |-- SSH ---------> [ EC2 Bastion ]  -- SSH --> Frontend / Backend
```

**Instancias EC2:**

| Nombre | Rol | IP publica |
|---|---|---|
| Bastion | Puerta de entrada SSH | Elastic IP asignada |
| Frontend | Angular + Apache + HTTPS | Elastic IP (bookshell.duckdns.org) |
| Backend | Laravel + Apache | Solo IP privada (acceso via bastion) |

**Requisitos adicionales implementados:**
- RDS MySQL 8.0 (base de datos gestionada, sin instalar MySQL en EC2)
- Application Load Balancer (ALB) con health checks
- Un solo repositorio GitHub para la aplicacion, con ramas separadas `Front` y `Back`

---

## Estructura de archivos

```
bookshell-infra/
|-- .github/
|   |-- workflows/
|       |-- terraform.yml          <- Crea/actualiza infraestructura AWS
|       |-- deploy_backend.yml     <- Despliega Laravel via SSH
|       |-- deploy_frontend.yml    <- Despliega Angular + activa HTTPS
|-- main.tf          <- EC2, RDS, ALB, EIPs, Security Groups
|-- variables.tf     <- Variables configurables
|-- backend.sh       <- Script arranque EC2 backend (templatefile Terraform, rama Back)
|-- frontend.sh      <- Script arranque EC2 frontend (templatefile Terraform, rama Front)
|-- deploy.yml       <- Workflow deploy backend (igual que deploy_backend.yml)
```

---

## PARTE 1 - Crear el repositorio en GitHub

### Paso 1.1 - Abrir GitHub

1. Abre **Chrome**.
2. Haz clic en la barra de direcciones (la franja blanca larga donde se escriben las URLs).
3. Borra lo que haya escrito y escribe: `https://github.com`
4. Pulsa la tecla **Enter**.
5. Se carga la pagina de inicio de GitHub.

### Paso 1.2 - Iniciar sesion en GitHub

1. En la pagina de inicio de GitHub, mira la esquina superior derecha.
2. Haz clic en el boton **Sign in** (color blanco con texto negro).
3. Escribe tu **nombre de usuario o email** en el primer campo.
4. Escribe tu **contrasena** en el segundo campo.
5. Haz clic en el boton verde **Sign in**.
6. Si no tienes cuenta: pulsa **Sign up** y sigue los pasos para crear una.

### Paso 1.3 - Crear un repositorio nuevo

1. Una vez dentro, mira la esquina superior derecha. Vers tu foto de perfil (o un circulo con tu inicial).
2. Justo a la izquierda de tu foto hay un icono con un simbolo **+** (mas). Haz clic en el.
3. En el menu que cae, haz clic en **New repository**.
4. Se abre una pagina con un formulario. Rellena lo siguiente:
   - **Owner**: deja el que aparece por defecto (tu usuario).
   - **Repository name**: escribe `bookshell-infra` (sin espacios, con guiones).
   - **Description**: escribe `Infraestructura AWS Terraform para Bookshell` (opcional).
   - Selecciona la opcion **Private** haciendo clic en el circulo que hay a su izquierda.
   - **NO** marques ninguna de las tres casillas de abajo (README, .gitignore, license).
5. Baja hasta el final de la pagina y haz clic en el boton verde **Create repository**.
6. Aparece una pagina con instrucciones. Dejala abierta.

### Paso 1.4 - Crear un Personal Access Token (necesario para el push)

Para subir codigo a GitHub desde la terminal necesitas un token (no vale la contrasena normal).

1. Haz clic en tu **foto de perfil** (esquina superior derecha).
2. En el menu que aparece, haz clic en **Settings**.
3. En la columna izquierda de la pagina Settings, baja hasta el final.
4. Haz clic en **Developer settings** (ultimo elemento de la lista).
5. Haz clic en **Personal access tokens**.
6. Haz clic en **Tokens (classic)**.
7. Haz clic en el boton **Generate new token** y luego en **Generate new token (classic)**.
8. En el campo **Note** escribe: `bookshell-push`
9. En **Expiration** selecciona **No expiration** (para el TFG es lo mas comodo).
10. En la seccion **Select scopes**, marca la casilla **repo** (marcara automaticamente todas las opciones de debajo).
11. Baja hasta el final y pulsa el boton verde **Generate token**.
12. **IMPORTANTE**: Aparece el token una sola vez, tiene este aspecto: `ghp_xxxxxxxxxxxxxx`. Copialo AHORA y guardalo en el Bloc de notas. Si cierras la pagina sin copiarlo, tendras que crear uno nuevo.

### Paso 1.5 - Subir los archivos del proyecto a GitHub

Abre **PowerShell** en Windows (pulsa la tecla Windows, escribe `powershell`, pulsa Enter):

```powershell
# Entra en la carpeta del proyecto (ajusta la ruta a donde tengas Terraform_tfg)
cd C:\Users\elect\Documents\aws_terraform\Terraform_tfg

# Inicializa git
git init

# Anade todos los archivos
git add .

# Primer commit
git commit -m "Infraestructura inicial Bookshell"

# Conecta con tu repositorio de GitHub
# CAMBIA TU_USUARIO por tu nombre de usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/bookshell-infra.git

# Establece la rama como main
git branch -M main

# Sube el codigo
git push -u origin main
```

Cuando pida usuario y contrasena:
- **Username**: tu nombre de usuario de GitHub
- **Password**: pega el token que copiaste en el paso 1.4 (empezara por `ghp_`)

---

## PARTE 2 - Configurar Secrets en GitHub

Los secrets son variables secretas que GitHub Actions usa sin mostrarlas en logs.

### Paso 2.1 - Ir a la seccion de Secrets

1. Estas en la pagina de tu repositorio `bookshell-infra`.
2. Mira las pestanas que hay debajo del nombre del repositorio: `Code`, `Issues`, `Pull requests`... la ultima es **Settings** (con un icono de engranaje). Haz clic en ella.
3. En la columna izquierda de la pagina Settings, busca el apartado **Security**.
4. Dentro de Security haz clic en **Secrets and variables**.
5. Haz clic en **Actions**.
6. Aparece la seccion **Repository secrets** con el boton **New repository secret**.

### Paso 2.2 - Anadir cada secret

Para cada secret de la tabla siguiente:
1. Haz clic en el boton **New repository secret**.
2. En el campo **Name** escribe el nombre exactamente como aparece (en mayusculas).
3. En el campo **Secret** pega el valor.
4. Haz clic en el boton verde **Add secret**.
5. Repite para el siguiente.

**Secrets iniciales (antes de aplicar Terraform):**

| Nombre del secret | Que pegar |
|---|---|
| `AWS_ACCESS_KEY_ID` | Tu Access Key ID de AWS (ver Parte 3) |
| `AWS_SECRET_ACCESS_KEY` | Tu Secret Access Key de AWS (ver Parte 3) |
| `TF_VAR_DB_PASSWORD` | Contrasena que inventes para la BD, ej: `Booksh3ll2024!` |
| `SSH_PRIVATE_KEY` | Contenido completo del archivo `.pem` (ver Parte 3) |
| `DUCKDNS_TOKEN` | Tu token de DuckDNS (ver Parte 4) |
| `CERTBOT_EMAIL` | Tu email, ej: `franciscomanueltoledo@gmail.com` |

**Secrets que anadir DESPUES de aplicar Terraform** (ver Parte 6):

| Nombre del secret | Que pegar |
|---|---|
| `BASTION_EIP` | IP publica del bastion (`terraform output bastion_eip`) |
| `BACKEND_PRIVATE_IP` | IP privada del backend (`terraform output backend_private_ip`) |
| `FRONTEND_PRIVATE_IP` | IP privada del frontend (`terraform output frontend_private_ip`) |
| `FRONTEND_EIP` | IP publica del frontend (`terraform output frontend_eip`) |

---

## PARTE 3 - Configurar AWS

### Paso 3.1 - Obtener credenciales AWS

**Si usas AWS Academy (Learner Lab):**
1. Abre tu Learner Lab en el navegador y arranca el laboratorio.
2. Haz clic en el boton naranja **AWS Details** (arriba a la derecha).
3. Haz clic en **Show** junto a "AWS CLI".
4. Aparecen tres lineas: `aws_access_key_id`, `aws_secret_access_key` y `aws_session_token`.
5. Copia el valor de `aws_access_key_id` y pegalo en el secret `AWS_ACCESS_KEY_ID`.
6. Copia el valor de `aws_secret_access_key` y pegalo en el secret `AWS_SECRET_ACCESS_KEY`.

**Si usas cuenta AWS normal:**
1. Entra en `https://console.aws.amazon.com`
2. Haz clic en tu nombre de usuario (esquina superior derecha) -> **Security credentials**
3. Baja hasta **Access keys** -> **Create access key**
4. Copia el **Access key ID** y el **Secret access key**

### Paso 3.2 - Crear el Key Pair en AWS

El Key Pair es como una llave que usas para conectarte a los servidores por SSH.

1. Abre Chrome y ve a `https://console.aws.amazon.com`
2. Mira la esquina superior derecha, junto a tu nombre aparece la region actual. Haz clic en ella y selecciona **US East (N. Virginia) us-east-1**.
3. En la barra de busqueda de arriba (donde dice "Search") escribe `EC2` y haz clic en el primer resultado.
4. En el menu izquierdo busca el apartado **Network & Security** y haz clic en **Key Pairs**.
5. Haz clic en el boton naranja **Create key pair** (arriba a la derecha).
6. Rellena el formulario:
   - **Name**: escribe exactamente `vockey` (debe coincidir con `variables.tf`)
   - **Key pair type**: selecciona **RSA**
   - **Private key file format**: selecciona **.pem**
7. Haz clic en el boton naranja **Create key pair**.
8. El archivo `vockey.pem` se descargara automaticamente. Guardalo, por ejemplo en `C:\Users\elect\.ssh\vockey.pem`.

### Paso 3.3 - Preparar el secret SSH_PRIVATE_KEY

El secret debe contener el texto completo del archivo `.pem`.

1. Abre PowerShell.
2. Ejecuta:
   ```powershell
   Get-Content C:\Users\elect\.ssh\vockey.pem
   ```
3. Aparece el contenido del archivo. Seleccionalo TODO (desde `-----BEGIN RSA PRIVATE KEY-----` hasta `-----END RSA PRIVATE KEY-----`, incluyendo esas lineas).
4. Copialo con Ctrl+C.
5. Pegalo en el secret `SSH_PRIVATE_KEY` de GitHub.

---

## PARTE 4 - Configurar DuckDNS

Ya tienes `bookshell.duckdns.org` apuntando a `79.145.87.177`.

### Encontrar tu token de DuckDNS

1. Abre Chrome y ve a `https://www.duckdns.org`
2. Inicia sesion con la misma cuenta que usaste para crear el subdominio `bookshell`.
3. En la parte superior de la pagina, debajo de tu nombre, hay una linea que empieza por **token** seguida de una cadena larga con guiones. Es algo como `a1b2c3d4-e5f6-7890-abcd-ef1234567890`.
4. Copia ese token y pegalo en el secret `DUCKDNS_TOKEN` de GitHub.

### Actualizacion manual de DuckDNS

Si necesitas apuntar el dominio a una nueva IP manualmente:
1. Abre Chrome.
2. En la barra de direcciones escribe la siguiente URL (sustituye los valores):
   ```
   https://www.duckdns.org/update?domains=bookshell&token=TU_TOKEN&ip=NUEVA_IP
   ```
3. Pulsa Enter. La pagina debe responder unicamente: `OK`

---

## PARTE 5 - Editar variables.tf

Antes de desplegar, edita el archivo `variables.tf` en tu PC para poner la URL del repositorio compartido y las ramas de cada parte.

Busca estas variables y cambia `TU_USUARIO` por tu usuario y, si hace falta, la URL del repo:

```hcl
variable "repo_url" {
   default = "https://github.com/TU_USUARIO/bookshell.git"
}

variable "backend_branch" {
   default = "Back"
}

variable "frontend_branch" {
   default = "Front"
}
```

Guarda el archivo y haz un nuevo `git add . && git commit -m "repositorio compartido y ramas" && git push`.

---

## PARTE 6 - Desplegar la infraestructura (Terraform)

### Opcion A - Desde GitHub Actions (recomendado, no hace falta tener Terraform instalado)

1. En Chrome, abre tu repositorio `bookshell-infra` en GitHub.
2. Haz clic en la pestana **Actions** (tiene un icono de rayo, es la quinta pestana).
3. En la columna izquierda vers los workflows disponibles. Haz clic en **Terraform CI/CD**.
4. En la parte central derecha aparece el boton **Run workflow**. Haz clic en el.
5. Sale un pequeno desplegable. Deja la rama en `main` y haz clic en el boton verde **Run workflow**.
6. Aparece una fila nueva con un circulo amarillo (en curso). Haz clic en ella para ver el progreso.
7. Puedes ver los pasos: Init, Validate, Plan, Apply. El mas lento es Apply (10-15 minutos por el RDS).
8. Cuando todos los pasos sean verdes, haz clic en el paso **Mostrar outputs de infraestructura** para ver las IPs.

### Opcion B - Desde tu PC con Terraform instalado

```powershell
# Entra en la carpeta
cd C:\Users\elect\Documents\aws_terraform\Terraform_tfg

# Configura credenciales AWS (ajusta los valores)
$env:AWS_ACCESS_KEY_ID="AKIAXXXXXXXXXXXXXXXX"
$env:AWS_SECRET_ACCESS_KEY="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
$env:TF_VAR_db_password="Booksh3ll2024!"

# Inicializar (solo la primera vez)
terraform init

# Ver que va a crear
terraform plan

# Crear la infraestructura
terraform apply -auto-approve
```

Al terminar vers algo como:
```
bastion_eip         = "1.2.3.4"        <- SSH de entrada
frontend_eip        = "5.6.7.8"        <- apunta bookshell.duckdns.org aqui
frontend_private_ip = "172.31.10.20"
backend_private_ip  = "172.31.10.30"
rds_endpoint        = "bookshell-db.xxxx.us-east-1.rds.amazonaws.com"
alb_dns             = "bookshell-alb-xxxx.us-east-1.elb.amazonaws.com"
```

### Paso 6.1 - Anadir los secrets con las IPs obtenidas

Con los valores de los outputs, vuelve a GitHub -> Settings -> Secrets y anade:
- `BASTION_EIP` = valor de `bastion_eip`
- `BACKEND_PRIVATE_IP` = valor de `backend_private_ip`
- `FRONTEND_PRIVATE_IP` = valor de `frontend_private_ip`
- `FRONTEND_EIP` = valor de `frontend_eip`

### Paso 6.2 - Actualizar DuckDNS con la IP del frontend

Si `frontend_eip` es diferente a `79.145.87.177`:
1. Abre Chrome.
2. Escribe en la barra de direcciones (cambia los valores):
   ```
   https://www.duckdns.org/update?domains=bookshell&token=TU_TOKEN&ip=FRONTEND_EIP
   ```
3. Pulsa Enter. Debe responder `OK`.

---

## PARTE 7 - Desplegar las aplicaciones

### 7.1 - Desplegar el backend (Laravel)

#### Desde GitHub Actions

1. En GitHub -> pestana **Actions** -> workflow **Deploy Backend (Laravel)**.
2. Haz clic en **Run workflow** -> boton verde **Run workflow**.
3. El workflow se conecta al backend a traves del bastion y ejecuta: `git pull origin Back`, `composer install`, `php artisan migrate`, recarga Apache.

#### Desde SSH (manual)

```powershell
# Conectar al bastion desde tu PC
ssh -i C:\Users\elect\.ssh\vockey.pem ubuntu@BASTION_EIP

# Una vez dentro del bastion, conectar al backend
ssh -i ~/.ssh/vockey.pem ubuntu@BACKEND_PRIVATE_IP
```

Una vez dentro del backend:
```bash
cd /var/www/back
sudo git pull origin Back
sudo composer install --no-dev
sudo php artisan migrate --force
sudo php artisan config:cache
sudo systemctl reload apache2
```

**Atajo directo desde tu PC al backend (sin entrar antes en el bastion):**
```powershell
ssh -i C:\Users\elect\.ssh\vockey.pem -J ubuntu@BASTION_EIP ubuntu@BACKEND_PRIVATE_IP
```

### 7.2 - Desplegar el frontend (Angular)

#### Desde GitHub Actions

1. En GitHub -> **Actions** -> workflow **Deploy Frontend (Angular)**.
2. Haz clic en **Run workflow** -> **Run workflow**.
3. El workflow hace: actualiza DuckDNS -> `git pull origin Front` -> build Angular -> copia a `/var/www/html/` -> activa HTTPS con certbot.

#### Desde SSH (manual)

```powershell
# Conectar al frontend via bastion (atajo directo)
ssh -i C:\Users\elect\.ssh\vockey.pem -J ubuntu@BASTION_EIP ubuntu@FRONTEND_PRIVATE_IP
```

Una vez dentro del frontend:
```bash
cd /var/www/front
sudo git pull origin Front
sudo npm ci
sudo npm run build -- --configuration production

sudo rm -rf /var/www/html/*
DIST_DIR=$(find /var/www/front/dist -name "index.html" -exec dirname {} \; | head -1)
sudo cp -r $DIST_DIR/* /var/www/html/

sudo systemctl reload apache2
```

---

## Si Front y Back estan en el mismo repo

Este es el flujo correcto para tu caso:

1. Un solo repositorio GitHub.
2. Dos ramas de aplicacion:
   - `Front` para Angular.
   - `Back` para Laravel.
3. Terraform se queda en `main` o en una carpeta del mismo repo.
4. La EC2 frontend clona y despliega la rama `Front`.
5. La EC2 backend clona y despliega la rama `Back`.
6. GitHub Actions se disparan por rama:
   - push en `Front` -> deploy del frontend.
   - push en `Back` -> deploy del backend.

Ejemplo:

```bash
git checkout Front
git add .
git commit -m "cambio frontend"
git push origin Front

git checkout Back
git add .
git commit -m "cambio backend"
git push origin Back
```

---

## PARTE 8 - Activar HTTPS con Let's Encrypt

**Antes de este paso**: `bookshell.duckdns.org` debe apuntar a la IP del frontend. Espera 2-3 minutos tras actualizar DuckDNS para que el DNS se propague.

### Opcion A - Automatico (via workflow deploy_frontend.yml)

Si tienes el secret `CERTBOT_EMAIL` configurado, el workflow lo hace automaticamente al desplegarse.

### Opcion B - Manual via SSH

```powershell
# Conectar al frontend
ssh -i C:\Users\elect\.ssh\vockey.pem -J ubuntu@BASTION_EIP ubuntu@FRONTEND_PRIVATE_IP
```

Una vez dentro:
```bash
# Solicitar certificado Let's Encrypt (cambia tu@email.com)
sudo certbot --apache \
  -d bookshell.duckdns.org \
  --non-interactive \
  --agree-tos \
  -m tu@email.com \
  --redirect

# Verificar que funciona
sudo apachectl configtest
sudo systemctl status apache2
```

Para comprobar la renovacion automatica:
```bash
sudo certbot renew --dry-run
```

### Verificar HTTPS

1. Abre Chrome.
2. Escribe en la barra de direcciones: `https://bookshell.duckdns.org`
3. Pulsa Enter.
4. Debe aparecer el **candado verde** (o icono de candado) a la izquierda de la URL.
5. La aplicacion Angular debe cargarse correctamente.

---

## PARTE 9 - Comandos SSH de referencia rapida

Reemplaza `BASTION_EIP`, `BACKEND_PRIVATE_IP` y `FRONTEND_PRIVATE_IP` con los outputs reales de Terraform.

```powershell
# Conectar al bastion
ssh -i C:\Users\elect\.ssh\vockey.pem ubuntu@BASTION_EIP

# Conectar al backend (directo desde tu PC, sin entrar antes en el bastion)
ssh -i C:\Users\elect\.ssh\vockey.pem -J ubuntu@BASTION_EIP ubuntu@BACKEND_PRIVATE_IP

# Conectar al frontend (directo desde tu PC)
ssh -i C:\Users\elect\.ssh\vockey.pem -J ubuntu@BASTION_EIP ubuntu@FRONTEND_PRIVATE_IP

# Ver logs del backend en tiempo real
ssh -i C:\Users\elect\.ssh\vockey.pem -J ubuntu@BASTION_EIP ubuntu@BACKEND_PRIVATE_IP "sudo tail -f /var/log/apache2/error.log"

# Ver logs del frontend en tiempo real
ssh -i C:\Users\elect\.ssh\vockey.pem -J ubuntu@BASTION_EIP ubuntu@FRONTEND_PRIVATE_IP "sudo tail -f /var/log/apache2/error.log"

# Copiar un archivo al backend desde tu PC
scp -i C:\Users\elect\.ssh\vockey.pem -o "ProxyJump ubuntu@BASTION_EIP" archivo.txt ubuntu@BACKEND_PRIVATE_IP:/home/ubuntu/
```

---

## PARTE 10 - Verificacion final

| Que verificar | Como verificarlo |
|---|---|
| Infraestructura creada | `terraform output` desde tu PC o ver en consola AWS |
| Bastion accesible SSH | `ssh -i vockey.pem ubuntu@BASTION_EIP` -> debe entrar |
| Backend responde | Desde el bastion: `curl http://BACKEND_PRIVATE_IP` |
| Frontend HTTP | Abrir `http://bookshell.duckdns.org` en Chrome |
| Frontend HTTPS | Abrir `https://bookshell.duckdns.org` en Chrome (candado verde) |
| ALB funcionando | Abrir `http://ALB_DNS` en Chrome |
| RDS accesible | SSH al backend -> `mysql -h RDS_ENDPOINT -u admin -p` |

---

## Resumen de todos los secrets

| Secret | Cuando se necesita | Como obtenerlo |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | Terraform CI/CD | AWS Console o Learner Lab |
| `AWS_SECRET_ACCESS_KEY` | Terraform CI/CD | AWS Console o Learner Lab |
| `TF_VAR_DB_PASSWORD` | Terraform CI/CD | Lo inventas tu (mayusculas + numeros + simbolo) |
| `SSH_PRIVATE_KEY` | Deploy workflows | Contenido del archivo `vockey.pem` |
| `DUCKDNS_TOKEN` | Deploy Frontend | duckdns.org -> tu cuenta |
| `CERTBOT_EMAIL` | Deploy Frontend | Tu email |
| `BASTION_EIP` | Deploy workflows | `terraform output bastion_eip` |
| `BACKEND_PRIVATE_IP` | Deploy Backend | `terraform output backend_private_ip` |
| `FRONTEND_PRIVATE_IP` | Deploy Frontend | `terraform output frontend_private_ip` |
| `FRONTEND_EIP` | Deploy Frontend | `terraform output frontend_eip` |
