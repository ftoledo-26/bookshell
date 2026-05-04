variable "region" {
  description = "Region AWS donde desplegar"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "Tipo de instancia EC2"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "Nombre del Key Pair en AWS para acceso SSH"
  type        = string
  default     = "vockey"
}

variable "db_name" {
  description = "Nombre de la base de datos en RDS"
  type        = string
  default     = "bookshell"
}

variable "db_user" {
  description = "Usuario administrador de RDS"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "Contrasena del administrador de RDS (usar TF_VAR_db_password)"
  type        = string
  sensitive   = true
  default     = "password"
}

variable "domain" {
  description = "Dominio publico del frontend para HTTPS"
  type        = string
  default     = "bookshell.duckdns.org"
}

variable "repo_url" {
  description = "URL HTTPS del repositorio GitHub compartido para Front y Back"
  type        = string
  default     = "https://github.com/ftoledo-26/bookshell.git"
}

variable "backend_branch" {
  description = "Rama del backend dentro del mismo repo"
  type        = string
  default     = "Back"
}

variable "frontend_branch" {
  description = "Rama del frontend dentro del mismo repo"
  type        = string
  default     = "Front"
}
