# bookshell

``` bash
frontend/
├── src/
│   ├── app/
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── book-card/
│   │   │   ├── review-card/
│   │   │   ├── navbar/
│   │   │   └── rating/
│   │   │
│   │   ├── pages/             # Páginas principales
│   │   │   ├── home/
│   │   │   ├── books/
│   │   │   ├── book-detail/
│   │   │   ├── profile/
│   │   │   └── auth/
│   │   │
│   │   ├── services/          # Servicios para consumir API
│   │   │   ├── book.service.ts
│   │   │   ├── review.service.ts
│   │   │   └── auth.service.ts
│   │   │
│   │   ├── guards/            # Guards de rutas (login, roles, etc.)
│   │   ├── interceptors/      # Interceptores HTTP (token JWT)
│   │   ├── models/            # Interfaces y modelos TS
│   │   │   ├── book.model.ts
│   │   │   ├── review.model.ts
│   │   │   └── user.model.ts
│   │   └── app-routing.module.ts
│   │
│   ├── assets/                # Imágenes, fuentes y recursos estáticos
│   └── styles/                # CSS global / Tailwind / variables
│
├── angular.json               # Configuración Angular CLI
├── package.json               # Dependencias y scripts npm
├── tsconfig.json              # Configuración TypeScript
└── README.md




ng serve --host 0.0.0.0
```
