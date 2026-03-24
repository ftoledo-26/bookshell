FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Dependencias básicas
RUN apt-get update && apt-get install -y \
    curl \
    git \
    sudo \
    build-essential \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Node.js LTS
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

# Instalar Angular CLI como root
RUN npm install -g @angular/cli@latest

# Crear usuario vscode
RUN useradd -ms /bin/bash vscode \
    && echo "vscode ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER vscode
WORKDIR /workspace