terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.21.0"
    }
  }
}

provider "aws" {
  region = var.region
}

######################
# SECURITY GROUPS
######################

# Bastion
resource "aws_security_group" "bastion_sg" {
  name = "bastion-sg"
}

resource "aws_vpc_security_group_ingress_rule" "bastion_ssh" {
  security_group_id = aws_security_group.bastion_sg.id
  from_port   = 22
  to_port     = 22
  ip_protocol = "tcp"
  cidr_ipv4   = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "bastion_out" {
  security_group_id = aws_security_group.bastion_sg.id
  ip_protocol = "-1"
  cidr_ipv4   = "0.0.0.0/0"
}

# Frontend
resource "aws_security_group" "frontend_sg" {
  name = "frontend-sg"
}

resource "aws_vpc_security_group_ingress_rule" "frontend_http" {
  security_group_id = aws_security_group.frontend_sg.id
  from_port = 80
  to_port   = 80
  ip_protocol = "tcp"
  cidr_ipv4 = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "frontend_https" {
  security_group_id = aws_security_group.frontend_sg.id
  from_port = 443
  to_port   = 443
  ip_protocol = "tcp"
  cidr_ipv4 = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "frontend_ssh" {
  security_group_id = aws_security_group.frontend_sg.id
  from_port = 22
  to_port   = 22
  ip_protocol = "tcp"
  referenced_security_group_id = aws_security_group.bastion_sg.id
}

# Backend
resource "aws_security_group" "backend_sg" {
  name = "backend-sg"
}

resource "aws_vpc_security_group_ingress_rule" "backend_http" {
  security_group_id = aws_security_group.backend_sg.id
  from_port = 80
  to_port   = 80
  ip_protocol = "tcp"
  referenced_security_group_id = aws_security_group.frontend_sg.id
}

resource "aws_vpc_security_group_ingress_rule" "backend_ssh" {
  security_group_id = aws_security_group.backend_sg.id
  from_port = 22
  to_port   = 22
  ip_protocol = "tcp"
  referenced_security_group_id = aws_security_group.bastion_sg.id
}

######################
# INSTANCIAS
######################

resource "aws_instance" "bastion" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = var.key_name
  vpc_security_group_ids = [aws_security_group.bastion_sg.id]

  tags = { Name = "Bastion" }
}

resource "aws_instance" "backend" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = var.key_name
  vpc_security_group_ids = [aws_security_group.backend_sg.id]

  user_data = file("backend.sh")

  tags = { Name = "Backend" }
}

resource "aws_instance" "frontend" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = var.key_name
  vpc_security_group_ids = [aws_security_group.frontend_sg.id]

  user_data = file("frontend.sh"){
    Backend_ip = 0.0.0.0
  }

  tags = { Name = "Frontend" }
}

######################
# ELASTIC IP (requisito)
######################
resource "aws_eip" "frontend_ip" {
  instance = aws_instance.frontend.id
}