FROM php:8.4-apache

# Dependencias del sistema y extensiones PHP necesarias para Laravel
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
 && docker-php-ext-install pdo_mysql zip mbstring gd xml \
 && a2enmod rewrite \
 && rm -rf /var/lib/apt/lists/*

# --- ESTAS LINEAS HAY QUE PONERLAS SI TRABAJO EN EL PROYECTO EN LINUX INTEGRADO DE WINDOWS
# --- SI TRABAJO CON WINDOWS HAY QUE COMENTARLO
# Cambiamos el ID del usuario www-data (33) al 1000 (que es el tuyo)
RUN usermod -u 1000 www-data && groupmod -g 1000 www-data
# --- FIN CONFIGURACION CONDICIONAL ---

# DocumentRoot en /var/www/html/public (Laravel)
RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

RUN chown -R www-data:www-data /var/www/html
USER www-data

ENV COMPOSER_HOME=/tmp/composer
ENV COMPOSER_CACHE_DIR=/tmp/composer/cache

RUN mkdir -p /tmp/composer/cache \
    && chown -R www-data:www-data /tmp/composer

# Instalar Composer dentro del contenedor
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
