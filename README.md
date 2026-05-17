# Bookshell

Aplicación web para gestionar y descubrir libros. Los usuarios pueden crear perfiles, añadir libros a su librería personal, escribir reseñas, seguir a otros lectores y explorar recomendaciones personalizadas.

## Tecnologías utilizadas

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 21 + Tailwind CSS |
| Backend | Laravel 11 (API REST) |
| Autenticación | JWT (Bearer token en localStorage) |
| Panel admin | Filament (acceso por rol admin) |
| Infraestructura | AWS EC2 + Apache + DuckDNS + Let's Encrypt |
| CI/CD | GitHub Actions |

## Objetivos

- Plataforma social de libros: perfil de usuario, librería personal, reseñas y sistema de seguidores.
- API REST con Laravel consumida desde Angular mediante HttpClient e interceptor JWT.
- Panel de administración exclusivo para usuarios con rol admin (Filament).
- Tests unitarios automatizados en GitHub Actions en cada push.

## Estructura del proyecto

```
bookshell/
├── frontend/          # Angular 21 SPA
│   ├── src/app/
│   │   ├── components/    # Componentes reutilizables (site-header, comments-feed…)
│   │   ├── pages/         # Páginas (home, login, usuario, mi_libreria, comentarios)
│   │   ├── services/      # Servicios HTTP (Book, Login, Usuario, Comentario, Follow)
│   │   ├── guards/        # authGuard (protege rutas privadas)
│   │   ├── interceptors/  # authInterceptor (añade Bearer token)
│   │   └── models/        # Interfaces TypeScript
│   └── src/tests/         # Tests unitarios con Vitest
├── app/               # Backend Laravel 11
├── .github/workflows/ # CI/CD: deploy frontend, backend, tests
└── Terraform_tfg/     # Infraestructura como código (AWS)
```

## Seguimiento de tareas

Tablero Trello con sprints del proyecto:
🔗 **[Ver tablero Trello](https://trello.com/b/XXXXXXXXX)**  ← sustituye con tu enlace real

## Ramas principales

| Rama | Propósito |
|------|-----------|
| `main` | Producción |
| `Front` | Desarrollo frontend |
| `Back` | Desarrollo backend |

## Demo

📺 [Vídeo de presentación](https://youtu.be/NuBrAkYFazA?si=-IFGRMvcEkk9d-mY)

## Plan de empresa

📊 [Presentación Canva](https://canva.link/6knr3oj449jrfy7)
