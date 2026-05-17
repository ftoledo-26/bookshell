# 📚 Bookshell

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

## Descripción

Bookshell es una aplicación fullstack de gestión de biblioteca personal y red social literaria. Los usuarios pueden:

- Explorar un catálogo de libros importado desde la Open Library API
- Escribir y gestionar reseñas con puntuación
- Añadir libros a su librería personal
- Seguir a otros usuarios y ver sus reseñas
- Administrar el sistema mediante un panel Filament (solo administradores)

---

## Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| **Frontend** | Angular 21, TypeScript 5, CSS |
| **Backend** | Laravel 12, PHP 8.2, Sanctum (JWT) |
| **Base de datos** | MySQL 8.0 (AWS RDS) |
| **Servidor web** | Apache 2.4 con mod_proxy, mod_rewrite |
| **Infraestructura** | AWS EC2, RDS, ALB, Elastic IP |
| **IaC** | Terraform |
| **CI/CD** | GitHub Actions |
| **DNS** | DuckDNS + Let's Encrypt (HTTPS) |
| **Seguridad** | OWASP ModSecurity WAF |
| **Documentación API** | Swagger UI |

---

## Arquitectura

```
Internet
   │
   ├── HTTPS/HTTP ──► [ ALB bookshell-alb ]
   │                          │
   │                          ▼
   ├── HTTPS/HTTP ──► [ EC2 Frontend ]          ← Angular + Apache + HTTPS
   │                  bookshell.duckdns.org      ← Elastic IP pública
   │                          │ ProxyPass /api, /swagger, /filament…
   │                          ▼
   │                  [ EC2 Backend ]            ← Laravel + Apache
   │                  (IP privada)               ← Acceso SSH solo via bastion
   │                          │ MySQL :3306
   │                          ▼
   │                  [ RDS MySQL 8.0 ]          ← Base de datos gestionada
   │
   └── SSH ─────────► [ EC2 Bastion ]  ──SSH──► Frontend / Backend
```

### Instancias EC2

| Instancia | Rol | Acceso |
|---|---|---|
| **Bastion** | Puerta de entrada SSH | Elastic IP pública |
| **Frontend** | Angular + Apache + HTTPS + ModSecurity WAF | Elastic IP → `bookshell.duckdns.org` |
| **Backend** | Laravel + Apache + MySQL client | Solo IP privada (vía bastion) |

---

## Estructura del repositorio

```
bookshell/
├── .github/
│   └── workflows/
│       ├── terraform.yml          # Crea/actualiza infraestructura AWS
│       ├── deploy_backend.yml     # Despliega Laravel via SSH (rama Back)
│       └── deploy_frontend.yml    # Despliega Angular + HTTPS (rama Front)
│
├── Terraform_tfg/
│   ├── main.tf                    # EC2, RDS, ALB, EIPs, Security Groups
│   ├── variables.tf               # Variables configurables
│   ├── backend.sh                 # Script arranque EC2 backend
│   └── frontend.sh                # Script arranque EC2 frontend + ModSecurity
│
├── frontend/                      # Rama Front — Angular 21
│   ├── src/
│   │   └── app/
│   │       ├── components/        # Componentes reutilizables
│   │       ├── pages/             # Páginas principales
│   │       ├── services/          # Servicios HTTP
│   │       ├── guards/            # Guards de autenticación
│   │       ├── models/            # Interfaces TypeScript
│   │       └── environments/      # Variables de entorno
│   ├── angular.json
│   └── package.json
│
├── app/                           # Rama Back — Laravel 12
│   └── Http/
│       ├── Controllers/Api/       # Controladores REST
│       └── Resources/             # API Resources (transformadores JSON)
├── routes/
│   ├── api.php                    # Rutas API REST
│   └── web.php                    # Rutas web (Swagger, Filament)
└── resources/views/
    └── swagger.blade.php          # Swagger UI
```

---

## Ramas

| Rama | Contenido | Deploy automático |
|---|---|---|
| `main` | Infraestructura Terraform + workflows CI/CD | — |
| `Back` | Backend Laravel (API REST, modelos, migraciones) | Push a `Back` → deploy backend |
| `Front` | Frontend Angular (componentes, servicios, páginas) | Push a `Front` → deploy frontend |

---

## Requisitos cumplidos

### DAWEC — Desarrollo de Aplicaciones Web en Entorno Cliente (Angular)

| Requisito | Estado | Detalle |
|---|---|---|
| Angular CLI 21 LTS | ✅ | Generado con `ng new`, versión 21.2.3 |
| Git + GitHub + ramas | ✅ | Ramas `main`, `Front`, `Back` + PRs |
| README con descripción y tecnologías | ✅ | Este documento |
| Routing | ✅ | `app.routes.ts` con rutas para Home, Login, Usuario, Librería, Reseñas, Comentarios |
| Token en LocalStorage | ✅ | `Login.service.ts` almacena el token Sanctum |
| Módulo administración solo para admin | ✅ | Panel Filament en `/filament` protegido por rol |
| Comunicación entre componentes (inputs/outputs) | ✅ | Uso de `@Input()`, `@Output()` y `EventEmitter` |
| Services | ✅ | `Book.service`, `Usuario.service`, `Comentario.service`, `Login.service`… |
| Manejo de errores con `try…catch` | ✅ | En todas las peticiones HTTP de los services |
| Conexión con API externa (DAWES) | ✅ | Consumo de la API Laravel via `HttpClient` |
| Tests unitarios + GitHub Actions | ✅ | Tests con Vitest + workflow `test_ng.yml` |

### DAWES — Desarrollo de Aplicaciones Web en Entorno Servidor (Laravel)

| Requisito | Estado | Detalle |
|---|---|---|
| API REST completa | ✅ | Endpoints para libros, usuarios, reseñas, comentarios, likes, follows |
| Autenticación | ✅ | Laravel Sanctum con tokens Bearer |
| ORM + migraciones | ✅ | Eloquent ORM, migraciones versionadas |
| Panel de administración | ✅ | Filament 3 con gestión de modelos |
| API Resources | ✅ | `LibroResource`, `ComentarioResource`, `UserResource`… |
| Documentación API | ✅ | Swagger UI en `https://bookshell.duckdns.org/swagger` |
| Integración Open Library | ✅ | Importación de portadas y descripciones |

### DAWEB — Despliegue de Aplicaciones Web (AWS + Terraform)

#### Requisitos mínimos

| Requisito | Estado | Detalle |
|---|---|---|
| Despliegue en AWS | ✅ | 3 instancias EC2 (bastion, frontend, backend) |
| Al menos una instancia EC2 | ✅ | EC2 `t2.micro` x3 |
| Sin Beanstalk ni aprovisionamiento sencillo | ✅ | Todo configurado manualmente |
| Infraestructura en Terraform | ✅ | `Terraform_tfg/main.tf` completo |
| Pipeline CI/CD | ✅ | GitHub Actions (terraform.yml, deploy_backend.yml, deploy_frontend.yml) |
| Servidor web con todos los recursos | ✅ | Apache + PHP + MySQL en EC2 backend |
| IP elástica + acceso SSH | ✅ | Bastion con Elastic IP, frontend con Elastic IP |
| HTTPS | ✅ | Let's Encrypt via Certbot + `bookshell.duckdns.org` |

#### Requisitos adicionales

| Requisito | Estado | Detalle |
|---|---|---|
| RDS para base de datos | ✅ | RDS MySQL 8.0 `db.t3.micro`, `deletion_protection = true` |
| Balanceador de carga (ALB) | ✅ | Application Load Balancer con health checks |
| WAF OWASP ModSecurity | ✅ | `libapache2-mod-security2` + OWASP CRS, `SecRuleEngine On` |
| DNS | ⚙️ | DuckDNS (`bookshell.duckdns.org`) — no Route53 |
| Servidor FTP | ❌ | No implementado |
| AWS CodeDeploy | ❌ | Se usa GitHub Actions en su lugar |
| BD en EC2 dedicado / Docker | ❌ | Se usa RDS |

### DIW — Diseño de Interfaces Web

| Requisito | Estado | Detalle |
|---|---|---|
| Principios del diseño | ✅ | Layout coherente, tipografía, paleta de colores |
| Buenas prácticas en estilos | ✅ | CSS por componente en Angular, sin estilos inline |
| Framework / librería UI | ✅ | CSS propio + componentes Angular nativos |

---

## API REST — Endpoints principales

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `POST` | `/api/login` | Autenticación, devuelve token | ❌ |
| `POST` | `/api/register` | Registro de usuario | ❌ |
| `GET` | `/api/libros` | Listado de libros | ✅ |
| `GET` | `/api/libros/{id}` | Detalle de un libro | ✅ |
| `GET` | `/api/usuarios/{id}` | Perfil de usuario | ✅ |
| `GET` | `/api/usuarios/{id}/following` | Usuarios seguidos | ✅ |
| `POST` | `/api/follow/{id}` | Seguir a un usuario | ✅ |
| `DELETE` | `/api/follow/{id}` | Dejar de seguir | ✅ |
| `GET` | `/api/reviews` | Listado de reseñas | ✅ |
| `POST` | `/api/reviews` | Crear reseña | ✅ |
| `GET` | `/api/comentarios/{libro_id}` | Comentarios de un libro | ✅ |
| `POST` | `/api/comentarios` | Crear comentario | ✅ |
| `POST` | `/api/likes/{review_id}` | Dar like a reseña | ✅ |

Documentación interactiva completa: **`https://bookshell.duckdns.org/swagger`**

---

## Despliegue

### Infraestructura (Terraform)

```bash
cd Terraform_tfg
terraform init
terraform plan
terraform apply -auto-approve
```

O via GitHub Actions → workflow **Terraform CI/CD**.

### Variables de entorno necesarias (GitHub Secrets)

| Secret | Descripción |
|---|---|
| `AWS_ACCESS_KEY_ID` | Credenciales AWS |
| `AWS_SECRET_ACCESS_KEY` | Credenciales AWS |
| `SSH_PRIVATE_KEY` | Clave privada PEM del Key Pair |
| `TF_VAR_DB_PASSWORD` | Contraseña de la base de datos |
| `DUCKDNS_TOKEN` | Token de DuckDNS |
| `CERTBOT_EMAIL` | Email para Let's Encrypt |
| `BASTION_EIP` | IP pública del bastion (output Terraform) |
| `FRONTEND_PRIVATE_IP` | IP privada del frontend (output Terraform) |
| `FRONTEND_EIP` | IP pública del frontend (output Terraform) |
| `BACKEND_PRIVATE_IP` | IP privada del backend (output Terraform) |

### CI/CD — GitHub Actions

| Workflow | Trigger | Acción |
|---|---|---|
| `terraform.yml` | Push a `main` / manual | Crea/actualiza infraestructura AWS |
| `deploy_backend.yml` | Push a `Back` | Git pull + composer + migrate + reload Apache |
| `deploy_frontend.yml` | Push a `Front` | Git pull + npm build + copy dist + HTTPS |

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

## URL de producción

🌐 **https://bookshell.duckdns.org**

📖 **https://bookshell.duckdns.org/swagger** — Documentación API

🛠️ **https://bookshell.duckdns.org/filament** — Panel de administración

---

## Seguimiento del proyecto

- 📋 Trello: https://trello.com/invite/b/6a09deb05b2468e0e2a4d076/ATTI084f2fa54473dbdb8b657ef39a28d34eD6665206/bookshelf
- 🎨 Canva — Plan de empresa: https://canva.link/6knr3oj449jrfy7
