#!/bin/bash

apt update -y
apt install -y apache2 git curl

# Node (para Angular build)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

mkdir -p /var/www/front
cd /var/www/front

git clone https://github.com/TU_USUARIO/TU_REPO.git .

git checkout front

npm install
npm run build -- --configuration production

# Copiar Angular build
rm -rf /var/www/html/*
cp -r dist/*/* /var/www/html/

############################
# APACHE CONFIG
############################

cat > /etc/apache2/sites-available/000-default.conf <<EOF
<VirtualHost *:80>

    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html

    # Angular routing
    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # 🔥 REDIRECCIÓN /admin -> BACKEND LARAVEL
    ProxyPreserveHost On

    ProxyPass /admin http://${Backend_ip}/admin
    ProxyPassReverse /admin http://${Backend_ip}/admin

    ErrorLog \${APACHE_LOG_DIR}/error.log
    CustomLog \${APACHE_LOG_DIR}/access.log combined

</VirtualHost>
EOF

############################
# ACTIVAR MÓDULOS PROXY
############################

a2enmod proxy
a2enmod proxy_http

systemctl restart apache2
systemctl enable apache2