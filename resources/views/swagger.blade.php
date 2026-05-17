<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bookshell API — Documentación</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; }
    .swagger-ui .topbar { background-color: #1a1a2e; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
    .topbar-title { color: #fff; font-size: 1.2rem; font-weight: 700; padding: 0 1rem; line-height: 60px; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js"></script>
  <script>
    const BASE_URL = window.location.origin;

    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Bookshell API',
        description: 'API REST de Bookshell — plataforma social de libros. Permite gestionar usuarios, libros, reseñas y el sistema de seguidores. Los endpoints marcados con 🔒 requieren autenticación Bearer (Sanctum).',
        version: '1.0.0',
        contact: { name: 'Francisco Manuel Toledo' }
      },
      servers: [{ url: BASE_URL, description: 'Servidor principal' }],
      tags: [
        { name: 'Autenticación', description: 'Registro, login y logout' },
        { name: 'Usuarios', description: 'Perfil y gestión de usuarios' },
        { name: 'Libros', description: 'Catálogo de libros' },
        { name: 'Reviews', description: 'Reseñas de libros' },
        { name: 'User Reviews', description: 'Relación usuario-review' },
        { name: 'Seguidores', description: 'Sistema de seguimiento entre usuarios' }
      ],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'Sanctum' }
        },
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              name: { type: 'string', example: 'Francisco' },
              email: { type: 'string', format: 'email', example: 'francisco@example.com' },
              descripcion: { type: 'string', nullable: true, example: 'Amante de la lectura' },
              foto: { type: 'string', nullable: true, example: '/fotos/francisco.webp' },
              roll: { type: 'string', enum: ['user', 'admin'], example: 'user' }
            }
          },
          Libro: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              titulo: { type: 'string', example: 'El Gran Gatsby' },
              autor: { type: 'string', example: 'F. Scott Fitzgerald' },
              editorial: { type: 'string', nullable: true, example: 'Scribner' },
              anio_publicacion: { type: 'string', nullable: true, example: '1925' },
              genero: { type: 'string', nullable: true, example: 'Novela' },
              descripcion: { type: 'string', nullable: true, example: 'Clásico de la literatura americana' },
              foto: { type: 'string', nullable: true, example: '/libros/el-gran-gatsby.webp' }
            }
          },
          Review: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              libro_id: { type: 'integer', example: 1 },
              user_id: { type: 'integer', example: 1 },
              valoracion: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
              comentario: { type: 'string', nullable: true, example: 'Una obra maestra' }
            }
          },
          FollowStatus: {
            type: 'object',
            properties: {
              followers: { type: 'integer', example: 42 },
              following: { type: 'boolean', example: false }
            }
          },
          Error: {
            type: 'object',
            properties: {
              mensaje: { type: 'string', example: 'Recurso no encontrado' }
            }
          },
          Mensaje: {
            type: 'object',
            properties: {
              mensaje: { type: 'string', example: 'Operación completada exitosamente' }
            }
          }
        }
      },
      paths: {

        // ─────────────────────────────────────────────────────────────
        // AUTENTICACIÓN
        // ─────────────────────────────────────────────────────────────
        '/api/register': {
          post: {
            tags: ['Autenticación'],
            summary: 'Registrar nuevo usuario',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                      name: { type: 'string', example: 'Francisco' },
                      email: { type: 'string', format: 'email', example: 'francisco@example.com' },
                      password: { type: 'string', minLength: 8, example: 'password123' }
                    }
                  }
                }
              }
            },
            responses: {
              201: {
                description: 'Usuario registrado',
                content: { 'application/json': { schema: { type: 'object', properties: { mensaje: { type: 'string' }, user: { '$ref': '#/components/schemas/User' } } } } }
              },
              422: { description: 'Datos inválidos', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
            }
          }
        },

        '/api/login': {
          post: {
            tags: ['Autenticación'],
            summary: 'Iniciar sesión y obtener token Bearer',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                      email: { type: 'string', format: 'email', example: 'francisco@example.com' },
                      password: { type: 'string', example: 'password123' }
                    }
                  }
                }
              }
            },
            responses: {
              200: {
                description: 'Login correcto',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        mensaje: { type: 'string', example: 'Hola Francisco' },
                        access_token: { type: 'string', example: 'eyJ0eXAiOiJKV1QiLCJhbGciOi...' },
                        token_type: { type: 'string', example: 'Bearer' },
                        user: { '$ref': '#/components/schemas/User' }
                      }
                    }
                  }
                }
              },
              401: { description: 'Credenciales inválidas', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
            }
          }
        },

        '/api/logout': {
          post: {
            tags: ['Autenticación'],
            summary: '🔒 Cerrar sesión (revoca el token)',
            security: [{ bearerAuth: [] }],
            responses: {
              200: { description: 'Sesión cerrada', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Mensaje' } } } },
              401: { description: 'No autenticado' }
            }
          }
        },

        // ─────────────────────────────────────────────────────────────
        // USUARIOS
        // ─────────────────────────────────────────────────────────────
        '/api/usuarios': {
          get: {
            tags: ['Usuarios'],
            summary: 'Listar todos los usuarios',
            responses: {
              200: {
                description: 'Lista de usuarios',
                content: { 'application/json': { schema: { type: 'array', items: { '$ref': '#/components/schemas/User' } } } }
              }
            }
          }
        },

        '/api/usuarios/{id}': {
          get: {
            tags: ['Usuarios'],
            summary: 'Obtener usuario por ID',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
            responses: {
              200: { description: 'Usuario encontrado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/User' } } } },
              404: { description: 'Usuario no encontrado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
            }
          }
        },

        '/api/usuarios/buscar/{name}': {
          get: {
            tags: ['Usuarios'],
            summary: 'Buscar usuarios por nombre',
            parameters: [{ name: 'name', in: 'path', required: true, schema: { type: 'string' }, example: 'Fran' }],
            responses: {
              200: { description: 'Usuarios encontrados', content: { 'application/json': { schema: { type: 'array', items: { '$ref': '#/components/schemas/User' } } } } },
              404: { description: 'Sin resultados', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
            }
          }
        },

        '/api/users/{id}': {
          put: {
            tags: ['Usuarios'],
            summary: '🔒 Actualizar perfil de usuario',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
            requestBody: {
              content: {
                'multipart/form-data': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', example: 'Francisco M.' },
                      email: { type: 'string', format: 'email' },
                      password: { type: 'string', minLength: 8 },
                      descripcion: { type: 'string', nullable: true },
                      foto: { type: 'string', format: 'binary', description: 'Imagen de perfil (max 5MB)' }
                    }
                  }
                }
              }
            },
            responses: {
              200: { description: 'Usuario actualizado', content: { 'application/json': { schema: { type: 'object', properties: { mensaje: { type: 'string' }, data: { '$ref': '#/components/schemas/User' } } } } } },
              404: { description: 'Usuario no encontrado' }
            }
          },
          delete: {
            tags: ['Usuarios'],
            summary: '🔒 Eliminar usuario',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
            responses: {
              200: { description: 'Usuario eliminado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Mensaje' } } } },
              404: { description: 'Usuario no encontrado' }
            }
          }
        },

        // ─────────────────────────────────────────────────────────────
        // LIBROS
        // ─────────────────────────────────────────────────────────────
        '/api/libros': {
          get: {
            tags: ['Libros'],
            summary: 'Listar todos los libros',
            responses: {
              200: { description: 'Catálogo completo', content: { 'application/json': { schema: { type: 'array', items: { '$ref': '#/components/schemas/Libro' } } } } }
            }
          },
          post: {
            tags: ['Libros'],
            summary: '🔒 Crear un libro',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'multipart/form-data': {
                  schema: {
                    type: 'object',
                    required: ['titulo', 'autor'],
                    properties: {
                      titulo: { type: 'string', example: 'El Gran Gatsby' },
                      autor: { type: 'string', example: 'F. Scott Fitzgerald' },
                      editorial: { type: 'string', nullable: true },
                      anio_publicacion: { type: 'string', nullable: true, example: '1925' },
                      genero: { type: 'string', nullable: true, example: 'Novela' },
                      descripcion: { type: 'string', nullable: true },
                      foto: { type: 'string', format: 'binary', description: 'Portada del libro (max 5MB)' }
                    }
                  }
                }
              }
            },
            responses: {
              201: { description: 'Libro creado', content: { 'application/json': { schema: { type: 'object', properties: { mensaje: { type: 'string' }, data: { '$ref': '#/components/schemas/Libro' } } } } } },
              422: { description: 'Datos inválidos' }
            }
          }
        },

        '/api/libros/{id}': {
          get: {
            tags: ['Libros'],
            summary: 'Obtener libro por ID',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
            responses: {
              200: { description: 'Libro encontrado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Libro' } } } },
              404: { description: 'Libro no encontrado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
            }
          },
          put: {
            tags: ['Libros'],
            summary: '🔒 Actualizar libro',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
            requestBody: {
              content: {
                'multipart/form-data': {
                  schema: {
                    type: 'object',
                    properties: {
                      titulo: { type: 'string' },
                      autor: { type: 'string' },
                      editorial: { type: 'string', nullable: true },
                      anio_publicacion: { type: 'string', nullable: true },
                      genero: { type: 'string', nullable: true },
                      descripcion: { type: 'string', nullable: true },
                      foto: { type: 'string', format: 'binary' }
                    }
                  }
                }
              }
            },
            responses: {
              200: { description: 'Libro actualizado', content: { 'application/json': { schema: { type: 'object', properties: { mensaje: { type: 'string' }, data: { '$ref': '#/components/schemas/Libro' } } } } } },
              404: { description: 'Libro no encontrado' }
            }
          },
          delete: {
            tags: ['Libros'],
            summary: '🔒 Eliminar libro',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
            responses: {
              200: { description: 'Libro eliminado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Mensaje' } } } },
              404: { description: 'Libro no encontrado' }
            }
          }
        },

        '/api/libros/buscar/{title}': {
          get: {
            tags: ['Libros'],
            summary: 'Buscar libros por título',
            parameters: [{ name: 'title', in: 'path', required: true, schema: { type: 'string' }, example: 'Gatsby' }],
            responses: {
              200: { description: 'Libros encontrados', content: { 'application/json': { schema: { type: 'array', items: { '$ref': '#/components/schemas/Libro' } } } } },
              404: { description: 'Sin resultados', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
            }
          }
        },

        '/api/libros/{libroId}/opiniones': {
          get: {
            tags: ['Reviews'],
            summary: 'Opiniones de un libro concreto',
            parameters: [{ name: 'libroId', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
            responses: {
              200: { description: 'Reviews del libro', content: { 'application/json': { schema: { type: 'array', items: { '$ref': '#/components/schemas/Review' } } } } }
            }
          }
        },

        // ─────────────────────────────────────────────────────────────
        // REVIEWS
        // ─────────────────────────────────────────────────────────────
        '/api/reviews': {
          get: {
            tags: ['Reviews'],
            summary: 'Listar todas las reviews',
            responses: {
              200: { description: 'Lista de reviews', content: { 'application/json': { schema: { type: 'array', items: { '$ref': '#/components/schemas/Review' } } } } }
            }
          },
          post: {
            tags: ['Reviews'],
            summary: '🔒 Crear una review',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['libro_id', 'user_id'],
                    properties: {
                      libro_id: { type: 'integer', example: 1 },
                      user_id: { type: 'integer', example: 1 },
                      rating: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
                      comment: { type: 'string', nullable: true, example: 'Excelente libro' }
                    }
                  }
                }
              }
            },
            responses: {
              201: { description: 'Review creada', content: { 'application/json': { schema: { type: 'object', properties: { mensaje: { type: 'string' }, data: { '$ref': '#/components/schemas/Review' } } } } } },
              422: { description: 'Datos inválidos' }
            }
          }
        },

        '/api/reviews/{id}': {
          get: {
            tags: ['Reviews'],
            summary: 'Obtener review por ID',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
            responses: {
              200: { description: 'Review encontrada', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Review' } } } },
              404: { description: 'Review no encontrada', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
            }
          },
          put: {
            tags: ['Reviews'],
            summary: '🔒 Actualizar review',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      rating: { type: 'integer', minimum: 1, maximum: 5 },
                      comment: { type: 'string', nullable: true }
                    }
                  }
                }
              }
            },
            responses: {
              200: { description: 'Review actualizada', content: { 'application/json': { schema: { type: 'object', properties: { mensaje: { type: 'string' }, data: { '$ref': '#/components/schemas/Review' } } } } } },
              404: { description: 'Review no encontrada' }
            }
          },
          delete: {
            tags: ['Reviews'],
            summary: '🔒 Eliminar review',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
            responses: {
              200: { description: 'Review eliminada', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Mensaje' } } } },
              404: { description: 'Review no encontrada' }
            }
          }
        },

        // ─────────────────────────────────────────────────────────────
        // USER REVIEWS
        // ─────────────────────────────────────────────────────────────
        '/api/user_reviews': {
          get: {
            tags: ['User Reviews'],
            summary: 'Listar relaciones usuario-review',
            responses: {
              200: { description: 'Lista', content: { 'application/json': { schema: { type: 'array', items: { type: 'object' } } } } }
            }
          },
          post: {
            tags: ['User Reviews'],
            summary: '🔒 Crear relación usuario-review',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { type: 'object', properties: { user_id: { type: 'integer' }, review_id: { type: 'integer' } } }
                }
              }
            },
            responses: {
              201: { description: 'Creada' },
              422: { description: 'Datos inválidos' }
            }
          }
        },

        '/api/user_reviews/{id}': {
          get: {
            tags: ['User Reviews'],
            summary: 'Obtener por ID',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
            responses: {
              200: { description: 'Encontrada' },
              404: { description: 'No encontrada' }
            }
          },
          put: {
            tags: ['User Reviews'],
            summary: '🔒 Actualizar',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
            responses: { 200: { description: 'Actualizada' }, 404: { description: 'No encontrada' } }
          },
          delete: {
            tags: ['User Reviews'],
            summary: '🔒 Eliminar',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
            responses: { 200: { description: 'Eliminada' }, 404: { description: 'No encontrada' } }
          }
        },

        // ─────────────────────────────────────────────────────────────
        // SEGUIDORES
        // ─────────────────────────────────────────────────────────────
        '/api/usuarios/{id}/followers': {
          get: {
            tags: ['Seguidores'],
            summary: 'Número de seguidores del usuario (y si el auth lo sigue)',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
            responses: {
              200: {
                description: 'Estado de seguidores',
                content: { 'application/json': { schema: { '$ref': '#/components/schemas/FollowStatus' } } }
              }
            }
          }
        },

        '/api/usuarios/{id}/following': {
          get: {
            tags: ['Seguidores'],
            summary: 'Lista de usuarios que sigue el usuario',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
            responses: {
              200: {
                description: 'Usuarios seguidos',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          name: { type: 'string' },
                          foto: { type: 'string', nullable: true }
                        }
                      }
                    }
                  }
                }
              },
              404: { description: 'Usuario no encontrado' }
            }
          }
        },

        '/api/usuarios/{id}/follow': {
          post: {
            tags: ['Seguidores'],
            summary: '🔒 Seguir a un usuario',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del usuario a seguir', example: 2 }],
            responses: {
              200: { description: 'Ahora sigues al usuario', content: { 'application/json': { schema: { '$ref': '#/components/schemas/FollowStatus' } } } },
              422: { description: 'No puedes seguirte a ti mismo' }
            }
          },
          delete: {
            tags: ['Seguidores'],
            summary: '🔒 Dejar de seguir a un usuario',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 2 }],
            responses: {
              200: { description: 'Has dejado de seguir al usuario', content: { 'application/json': { schema: { '$ref': '#/components/schemas/FollowStatus' } } } }
            }
          }
        }
      }
    };

    SwaggerUIBundle({
      spec,
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      plugins: [SwaggerUIBundle.plugins.DownloadUrl],
      layout: 'BaseLayout',
      tryItOutEnabled: true,
      persistAuthorization: true
    });
  </script>
</body>
</html>
