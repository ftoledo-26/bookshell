<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

<<<<<<< HEAD
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
=======
Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
