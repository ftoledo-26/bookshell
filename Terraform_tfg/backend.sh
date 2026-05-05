#!/bin/bash
# Script de arranque del backend (Laravel + RDS).
# Terraform lo procesa como templatefile() — sustituye ${db_host}, ${db_name},
# ${db_user}, ${db_password}, ${repo_url} y ${repo_branch} antes de pasarselo a EC2.
set -e

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y software-properties-common
add-apt-repository -y ppa:ondrej/php
apt-get update -y
apt-get install -y \
    apache2 \
    php8.2 php8.2-cli php8.2-mysql php8.2-xml php8.2-mbstring \
    php8.2-curl php8.2-zip php8.2-intl php8.2-bcmath \
    git curl unzip

# Composer
curl -sS https://getcomposer.org/installer | php -- \
    --install-dir=/usr/local/bin --filename=composer

# Modulos Apache necesarios para Laravel
a2enmod rewrite

# Clonar repositorio backend
cd /var/www
git clone -b ${repo_branch} --single-branch ${repo_url} back
cd back

# Configurar variables de entorno con credenciales RDS
cp .env.example .env
sed -i "s|DB_HOST=.*|DB_HOST=${db_host}|"         .env
sed -i "s|DB_DATABASE=.*|DB_DATABASE=${db_name}|" .env
sed -i "s|DB_USERNAME=.*|DB_USERNAME=${db_user}|" .env
sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=${db_password}|" .env
sed -i "s|DB_CONNECTION=.*|DB_CONNECTION=mysql|"  .env

# Dependencias PHP
composer install --no-dev --optimize-autoloader
php artisan key:generate

# Esperar a que RDS este disponible (hasta 5 minutos)
for i in $(seq 1 30); do
  php artisan migrate --force && break || true
  echo "[backend.sh] Intento $i/30: RDS aun no disponible, esperando 10s..."
  sleep 10
done

chown -R www-data:www-data /var/www/back
chmod -R 775 /var/www/back/storage /var/www/back/bootstrap/cache

# VirtualHost Apache para Laravel (DocumentRoot apunta a /public)
cat > /etc/apache2/sites-available/000-default.conf <<'VHOST'
<VirtualHost *:80>
    DocumentRoot /var/www/back/public

    <Directory /var/www/back/public>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog /var/log/apache2/error.log
    CustomLog /var/log/apache2/access.log combined
</VirtualHost>
VHOST

systemctl restart apache2
systemctl enable apache2

echo "[backend.sh] Instalacion completada."
