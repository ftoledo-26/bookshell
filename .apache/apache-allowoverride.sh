#!/bin/bash
cp /etc/letsencrypt/renewal-hooks/deploy/bookshell-ssl.conf \
  /etc/apache2/sites-available/000-default-le-ssl.conf
cp /var/www/back/.apache/laravel.conf /etc/apache2/conf-available/laravel.conf
systemctl reload apache2
