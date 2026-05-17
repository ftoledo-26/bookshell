# Bookshell

> Plataforma web para descubrir libros, escribir reseñas y seguir a otros lectores.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20RDS%20%7C%20ALB-FF9900?logo=amazonaws&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?logo=terraform&logoColor=white)
![Apache](https://img.shields.io/badge/Apache-2.4-D22128?logo=apache&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?logo=githubactions&logoColor=white)

---

## Descripcion

Bookshell es una aplicacion fullstack de gestion de biblioteca personal y red social literaria. Los usuarios pueden:

- Explorar un catalogo de libros importado desde la Open Library API
- Escribir y gestionar resenas con puntuacion
- Anadir libros a su libreria personal
- Seguir a otros usuarios y ver sus resenas
- Administrar el sistema mediante un panel Filament (solo administradores)

---

## Tecnologias utilizadas

| Capa | Tecnologia |
|---|---|
| **Frontend** | Angular 21, TypeScript 5, CSS |
| **Backend** | Laravel 12, PHP 8.2, Sanctum |
| **Base de datos** | MySQL 8.0 (AWS RDS) |
| **Servidor web** | Apache 2.4 con mod_proxy, mod_rewrite |
| **Infraestructura** | AWS EC2, RDS, ALB, Elastic IP |
| **IaC** | Terraform |
| **CI/CD** | GitHub Actions |
| **DNS** | DuckDNS + Let's Encrypt (HTTPS) |
| **Seguridad** | OWASP ModSecurity WAF |
| **Documentacion API** | Swagger UI |

---

## Arquitectura

```
Internet
   |
   +-- HTTPS/HTTP --> [ ALB bookshell-alb ]
   |                          |
   |                          v
   +-- HTTPS/HTTP --> [ EC2 Frontend ]          <- Angular + Apache + HTTPS
   |                  bookshell.duckdns.org      <- Elastic IP publica
   |                          | ProxyPass /api, /swagger, /filament...
   |                          v
   |                  [ EC2 Backend ]            <- Laravel + Apache
   |                  (IP privada)               <- Acceso SSH solo via bastion
   |                          | MySQL :3306
   |                          v
   |                  [ RDS MySQL 8.0 ]          <- Base de datos gestionada
   |
   +-- SSH ----------> [ EC2 Bastion ]  --SSH--> Frontend / Backend
```

### Instancias EC2

| Instancia | Rol | Acceso |
|---|---|---|
| **Bastion** | Puerta de entrada SSH | Elastic IP publica |
| **Frontend** | Angular + Apache + HTTPS + ModSecurity WAF | Elastic IP -> `bookshell.duckdns.org` |
| **Backend** | Laravel + Apache + MySQL client | Solo IP privada (via bastion) |

---

## Estructura del repositorio

```
bookshell/
+-- .github/
|   +-- workflows/
|       +-- terraform.yml          # Crea/actualiza infraestructura AWS
|       +-- deploy_backend.yml     # Despliega Laravel via SSH (rama Back)
|       +-- deploy_frontend.yml    # Despliega Angular + HTTPS (rama Front)
|       +-- test_ng.yml            # Ejecuta tests unitarios Angular
|
+-- Terraform_tfg/
|   +-- main.tf                    # EC2, RDS, ALB, EIPs, Security Groups
|   +-- variables.tf               # Variables configurables
|   +-- backend.sh                 # Script arranque EC2 backend
|   +-- frontend.sh                # Script arranque EC2 frontend + ModSecurity
|
+-- frontend/                      # Rama Front -- Angular 21
|   +-- src/
|   |   +-- app/
|   |       +-- components/        # Componentes reutilizables
|   |       +-- pages/             # Paginas principales
|   |       +-- services/          # Servicios HTTP
|   |       +-- guards/            # Guards de autenticacion
|   |       +-- interceptors/      # Interceptores HTTP (auth, errores)
|   |       +-- models/            # Interfaces TypeScript
|   |       +-- environments/      # Variables de entorno
|   +-- angular.json
|   +-- package.json
|
+-- app/                           # Rama Back -- Laravel 12
|   +-- Http/
|       +-- Controllers/Api/       # Controladores REST
|       +-- Resources/             # API Resources (transformadores JSON)
+-- routes/
|   +-- api.php                    # Rutas API REST
|   +-- web.php                    # Rutas web (Swagger, Filament)
+-- resources/views/
    +-- swagger.blade.php          # Swagger UI
```

---

## Ramas

| Rama | Contenido | Deploy automatico |
|---|---|---|
| `main` | Infraestructura Terraform + workflows CI/CD | -- |
| `Back` | Backend Laravel (API REST, modelos, migraciones) | Push a `Back` -> deploy backend |
| `Front` | Frontend Angular (componentes, servicios, paginas) | Push a `Front` -> deploy frontend |

---

## Autenticacion y roles

### Flujo de autenticacion

```
1. POST /api/login  (email + password)
2. Laravel Sanctum valida credenciales --> devuelve token Bearer
3. Login.service.ts guarda en localStorage: token, userId, username, foto, roll
4. authInterceptor añade "Authorization: Bearer <token>" a cada peticion HTTP
5. Backend valida el token en cada endpoint con el middleware auth:sanctum
6. errorInterceptor detecta 401 --> limpia localStorage --> redirige a /login
```

### Sistema de roles

| Rol | Acceso | Gestion |
|---|---|---|
| `user` | Explorar libros, escribir resenas/comentarios, follows | Registro publico |
| `admin` | Panel Filament `/filament` + todas las funciones de usuario | Asignado en BD |

- El rol se almacena en `localStorage` tras el login (`Login.service.ts -> isAdmin()`)
- Los guards Angular controlan la navegacion en cliente; **la validacion real de permisos ocurre siempre en el backend** via middleware `auth:sanctum`

> Utilizamos guards e interceptores en Angular para gestionar navegacion y autenticacion en cliente, pero la validacion real de permisos y tokens se realiza siempre en backend mediante Sanctum y control de acceso sobre los endpoints de la API.

---

## Manejo de errores

| Capa | Mecanismo | Comportamiento |
|---|---|---|
| **Interceptor global** | `errorInterceptor` (HTTP) | 401 -> logout automatico + redirect `/login` |
| **Por servicio** | `catchError` (RxJS) | Devuelve valor por defecto sin romper la UI |
| **Datos locales** | `try/catch` | localStorage corrupto -> array vacio |

El `errorInterceptor` actua como capa global: cualquier respuesta 401 de la API limpia la sesion automaticamente sin necesidad de gestionarlo en cada servicio individualmente.

---

## Testing

| Tipo | Framework | Componentes cubiertos | CI |
|---|---|---|---|
| Tests unitarios | Vitest 4.0 | `app`, `login`, `home`, `mi_libreria`, `comentarios` | `test_ng.yml` |

```bash
cd frontend
npx ng test --watch=false
```

El workflow `test_ng.yml` se ejecuta automaticamente en cada push a las ramas `main` y `Front`, y en pull requests, asegurando que los tests pasan antes de cualquier despliegue.

---

## Requisitos cumplidos

### DAWEC -- Desarrollo de Aplicaciones Web en Entorno Cliente (Angular)

| Requisito | Estado | Detalle |
|---|---|---|
| Angular CLI 21 LTS | OK | Generado con `ng new`, version 21.2.3 |
| Git + GitHub + ramas | OK | Ramas `main`, `Front`, `Back` + PRs |
| README con descripcion y tecnologias | OK | Este documento |
| Routing | OK | `app.routes.ts` con rutas para Home, Login, Usuario, Libreria, Resenas, Comentarios |
| Token en LocalStorage | OK | `Login.service.ts` almacena el token Sanctum |
| Modulo administracion solo para admin | OK | Panel Filament en `/filament` protegido por rol |
| Comunicacion entre componentes (inputs/outputs) | OK | Uso de `@Input()`, `@Output()` y `EventEmitter` |
| Services | OK | `Book.service`, `Usuario.service`, `Comentario.service`, `Login.service`... |
| Interceptores HTTP | OK | `authInterceptor` (token Bearer) + `errorInterceptor` (401 global) |
| Manejo de errores | OK | `errorInterceptor` global + `catchError` por servicio + `try/catch` |
| Conexion con API externa (DAWES) | OK | Consumo de la API Laravel via `HttpClient` |
| Tests unitarios + GitHub Actions | OK | Tests con Vitest + workflow `test_ng.yml` |

### DAWES -- Desarrollo de Aplicaciones Web en Entorno Servidor (Laravel)

| Requisito | Estado | Detalle |
|---|---|---|
| API REST completa | OK | Endpoints para libros, usuarios, resenas, comentarios, likes, follows |
| Autenticacion | OK | Laravel Sanctum con tokens Bearer, middleware `auth:sanctum` |
| ORM + migraciones | OK | Eloquent ORM, migraciones versionadas |
| Panel de administracion | OK | Filament 3 con gestion de modelos |
| API Resources | OK | `LibroResource`, `ComentarioResource`, `UserResource`... |
| Documentacion API | OK | Swagger UI en `https://bookshell.duckdns.org/swagger` |
| Integracion Open Library | OK | Importacion de portadas y descripciones |

### DAWEB -- Despliegue de Aplicaciones Web (AWS + Terraform)

#### Requisitos minimos

| Requisito | Estado | Detalle |
|---|---|---|
| Despliegue en AWS | OK | 3 instancias EC2 (bastion, frontend, backend) |
| Al menos una instancia EC2 | OK | EC2 `t2.micro` x3 |
| Sin Beanstalk ni aprovisionamiento sencillo | OK | Todo configurado manualmente |
| Infraestructura en Terraform | OK | `Terraform_tfg/main.tf` completo |
| Pipeline CI/CD | OK | GitHub Actions (terraform.yml, deploy_backend.yml, deploy_frontend.yml) |
| Servidor web con todos los recursos | OK | Apache + PHP + MySQL en EC2 backend |
| IP elastica + acceso SSH | OK | Bastion con Elastic IP, frontend con Elastic IP |
| HTTPS | OK | Let's Encrypt via Certbot + `bookshell.duckdns.org` |

#### Requisitos adicionales

| Requisito | Estado | Detalle |
|---|---|---|
| RDS para base de datos | OK | RDS MySQL 8.0 `db.t3.micro`, `deletion_protection = true` |
| Balanceador de carga (ALB) | OK | Application Load Balancer con health checks |
| WAF OWASP ModSecurity | OK | `libapache2-mod-security2` + OWASP CRS, `SecRuleEngine On` |
| DNS | OK (DuckDNS) | DuckDNS (`bookshell.duckdns.org`) -- no Route53 |
| Servidor FTP | NO | No implementado |
| AWS CodeDeploy | NO | Se usa GitHub Actions en su lugar |
| BD en EC2 dedicado / Docker | NO | Se usa RDS |

### DIW -- Diseno de Interfaces Web

| Requisito | Estado | Detalle |
|---|---|---|
| Principios del diseno | OK | Layout coherente, tipografia, paleta de colores |
| Buenas practicas en estilos | OK | CSS por componente en Angular, sin estilos inline |
| Framework / libreria UI | OK | CSS propio + componentes Angular nativos |

---

## API REST -- Endpoints principales

| Metodo | Endpoint | Descripcion | Auth |
|---|---|---|---|
| `POST` | `/api/login` | Autenticacion, devuelve token | No |
| `POST` | `/api/register` | Registro de usuario | No |
| `GET` | `/api/libros` | Listado de libros | Si |
| `GET` | `/api/libros/{id}` | Detalle de un libro | Si |
| `GET` | `/api/usuarios/{id}` | Perfil de usuario | Si |
| `GET` | `/api/usuarios/{id}/following` | Usuarios seguidos | Si |
| `POST` | `/api/follow/{id}` | Seguir a un usuario | Si |
| `DELETE` | `/api/follow/{id}` | Dejar de seguir | Si |
| `GET` | `/api/reviews` | Listado de resenas | Si |
| `POST` | `/api/reviews` | Crear resena | Si |
| `GET` | `/api/comentarios/{libro_id}` | Comentarios de un libro | Si |
| `POST` | `/api/comentarios` | Crear comentario | Si |
| `POST` | `/api/likes/{review_id}` | Dar like a resena | Si |

Documentacion interactiva completa: **`https://bookshell.duckdns.org/swagger`**

---

## Despliegue

### Infraestructura (Terraform)

```bash
cd Terraform_tfg
terraform init
terraform plan
terraform apply -auto-approve
```

O via GitHub Actions -> workflow **Terraform CI/CD**.

### Variables de entorno necesarias (GitHub Secrets)

| Secret | Descripcion |
|---|---|
| `AWS_ACCESS_KEY_ID` | Credenciales AWS |
| `AWS_SECRET_ACCESS_KEY` | Credenciales AWS |
| `SSH_PRIVATE_KEY` | Clave privada PEM del Key Pair |
| `TF_VAR_DB_PASSWORD` | Contrasena de la base de datos |
| `DUCKDNS_TOKEN` | Token de DuckDNS |
| `CERTBOT_EMAIL` | Email para Let's Encrypt |
| `BASTION_EIP` | IP publica del bastion (output Terraform) |
| `FRONTEND_PRIVATE_IP` | IP privada del frontend (output Terraform) |
| `FRONTEND_EIP` | IP publica del frontend (output Terraform) |
| `BACKEND_PRIVATE_IP` | IP privada del backend (output Terraform) |

### CI/CD -- GitHub Actions

| Workflow | Trigger | Accion |
|---|---|---|
| `terraform.yml` | Push a `main` / manual | Crea/actualiza infraestructura AWS |
| `deploy_backend.yml` | Push a `Back` | Git pull + composer + migrate + reload Apache |
| `deploy_frontend.yml` | Push a `Front` | Git pull + npm build + copy dist + HTTPS |
| `test_ng.yml` | Push a `main`/`Front` + PRs | Tests unitarios Angular con Vitest |

---

## Desarrollo local

### Backend (Laravel)

```bash
cd /ruta/rama/Back
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend (Angular)

```bash
cd frontend
npm install
ng serve
# Acceder en http://localhost:4200
```

---

## URL de produccion

**https://bookshell.duckdns.org**

**https://bookshell.duckdns.org/swagger** -- Documentacion API

**https://bookshell.duckdns.org/filament** -- Panel de administracion

---

## Seguimiento del proyecto

- Trello: https://trello.com/invite/b/6a09deb05b2468e0e2a4d076/ATTI084f2fa54473dbdb8b657ef39a28d34eD6665206/bookshelf
- Canva — Plan de empresa: https://canva.link/6knr3oj449jrfy7
