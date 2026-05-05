#!/bin/bash
# Script de arranque del frontend (Angular + Apache).
# Terraform lo procesa como templatefile() — sustituye ${backend_ip},
# ${domain}, ${repo_url} y ${repo_branch} antes de pasarselo a EC2.
set -e

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y apache2 git curl certbot python3-certbot-apache

# Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Clonar repositorio frontend Angular
mkdir -p /var/www/front
cd /var/www/front
git clone -b ${repo_branch} --single-branch ${repo_url} .

# Build de produccion Angular
npm ci
npm run build -- --configuration production

# Copiar build a DocumentRoot (Angular 17+ genera en browser/, versiones anteriores directamente)
rm -rf /var/www/html/*
DIST_DIR=$(find /var/www/front/dist -name "index.html" -exec dirname {} \; | head -1)
cp -r $DIST_DIR/* /var/www/html/

# Apache VirtualHost — proxy /api al backend
# Los placeholders se reemplazan por sed despues del heredoc
cat > /etc/apache2/sites-available/000-default.conf <<'VHOST'
<VirtualHost *:80>
    ServerName DOMAIN_HERE
    DocumentRoot /var/www/html

    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ProxyPreserveHost On
    ProxyPass        /api http://BACKEND_IP_HERE:80/api
    ProxyPassReverse /api http://BACKEND_IP_HERE:80/api

    ErrorLog /var/log/apache2/error.log
    CustomLog /var/log/apache2/access.log combined
</VirtualHost>
VHOST

# Inyectar IPs y dominio reales (Terraform los sustituyo antes de ejecutar este script)
sed -i "s|DOMAIN_HERE|${domain}|g"         /etc/apache2/sites-available/000-default.conf
sed -i "s|BACKEND_IP_HERE|${backend_ip}|g" /etc/apache2/sites-available/000-default.conf

a2enmod rewrite proxy proxy_http

systemctl restart apache2
systemctl enable apache2

# ---------------------------------------------------------------
# HTTPS con Let's Encrypt (certbot)
# NOTA: solo funciona despues de que DuckDNS apunte al frontend_eip.
# El workflow deploy_frontend.yml lo ejecuta automaticamente.
# Para ejecutarlo manualmente via SSH:
#   sudo certbot --apache -d ${domain} --non-interactive --agree-tos \
#     -m admin@${domain} --redirect
# ---------------------------------------------------------------

# HTTPS con Let's Encrypt (requiere que DuckDNS ya apunte al frontend_eip)
certbot --apache -d ${domain} \
  --non-interactive --agree-tos \
  -m franciscomanueltoledo@gmail.com \
  --redirect || echo "[frontend.sh] AVISO: certbot fallo — HTTPS no activo. Ejecutar via workflow deploy_frontend cuando DuckDNS apunte aqui."

echo "[frontend.sh] Instalacion completada. Dominio: ${domain}, Backend: ${backend_ip}"
