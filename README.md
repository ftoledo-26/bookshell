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

## Plan TFG (entrega: 15 de mayo)

### Objetivo general
- Llegar a la entrega con una app funcional, testeada y documentada.
- Separar trabajo de autenticacion (login/sign in) para no bloquear el desarrollo.

### Roadmap por semanas

#### 15-21 abril
- Comentarios CRUD completo: crear, editar, borrar.
- Validaciones de formulario (longitud, campos obligatorios) y mensajes de error.
- Estados de carga y errores en UI.

#### 22-28 abril
- Busqueda de libros por texto.
- Filtros por autor y orden (popularidad/fecha).
- Limpieza de UX en filtros (aplicar, limpiar, mantener estado).

#### 29 abril-5 mayo
- Paginacion en backend para libros/comentarios.
- Infinite scroll en frontend consumiendo paginas reales.
- Control de fin de resultados y errores de red.

#### 6-10 mayo
- Tests unitarios de servicios y componentes clave.
- 2-3 flujos e2e criticos.
- Correccion de bugs detectados en pruebas.

#### 11-13 mayo
- Documentacion tecnica: arquitectura, decisiones, endpoints, pruebas.
- Capturas de funcionalidades principales.

#### 14-15 mayo
- Buffer final para incidencias de ultima hora.
- Preparacion de demo (8-10 min) con guion y datos de prueba.

### Reparto de trabajo (equipo)
- Companero: login/sign in.
- Este repositorio (tu foco): comentarios, busqueda/filtros, paginacion, testing y documentacion.
- Integracion final de auth cuando login este estable.

### Entregables minimos
- App funcional con comentarios CRUD.
- Busqueda + filtros operativos.
- Paginacion real (API + frontend).
- Tests ejecutados y documentados.
- Memoria tecnica y demo preparada.

### Riesgos y mitigacion
- Si la API de paginacion no llega a tiempo: usar contrato definido + mock temporal.
- Si la integracion de auth se retrasa: mantener flujos desacoplados y activar guards al final.
- Si falta tiempo para documentacion: redactar en paralelo desde la semana del 29 de abril.