#!/bin/bash

apt update -y
apt install -y apache2 mysql-server php php-mysql php-cli unzip git curl composer

cd /var/www
git clone https://github.com/TU_USUARIO/TU_REPO.git back

cd back
git checkout back

cp .env.example .env

# configurar DB local
sed -i 's/DB_DATABASE=.*/DB_DATABASE=app/' .env
sed -i 's/DB_USERNAME=.*/DB_USERNAME=root/' .env
sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=/' .env

mysql -e "CREATE DATABASE app;"

composer install

php artisan key:generate
php artisan migrate --force

chown -R www-data:www-data /var/www/back