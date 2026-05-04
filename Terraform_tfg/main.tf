terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket = "bookshell-tfg"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.region
}

# -----------------------------------------------------------------------
# DATA SOURCES
# -----------------------------------------------------------------------

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# -----------------------------------------------------------------------
# SECURITY GROUPS
# -----------------------------------------------------------------------

resource "aws_security_group" "bastion_sg" {
  name        = "bastion-sg"
  description = "SSH desde cualquier IP (punto de entrada SSH)"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "bastion-sg" }
}

resource "aws_security_group" "frontend_sg" {
  name        = "frontend-sg"
  description = "HTTP/HTTPS publico, SSH solo desde bastion"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description     = "SSH desde bastion"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "frontend-sg" }
}

resource "aws_security_group" "backend_sg" {
  name        = "backend-sg"
  description = "API desde frontend, SSH solo desde bastion"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "Laravel API desde frontend"
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.frontend_sg.id]
  }

  ingress {
    description     = "SSH desde bastion"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "backend-sg" }
}

resource "aws_security_group" "rds_sg" {
  name        = "rds-sg"
  description = "MySQL solo desde backend"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "MySQL desde backend"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.backend_sg.id]
  }

  tags = { Name = "rds-sg" }
}

resource "aws_security_group" "alb_sg" {
  name        = "alb-sg"
  description = "HTTP y HTTPS publico para el ALB"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "alb-sg" }
}

# -----------------------------------------------------------------------
# EC2 — BASTION
# -----------------------------------------------------------------------

resource "aws_instance" "bastion" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.bastion_sg.id]
  tags                   = { Name = "Bastion" }
}

resource "aws_eip" "bastion_eip" {
  domain   = "vpc"
  instance = aws_instance.bastion.id
  tags     = { Name = "bastion-eip" }
}

# -----------------------------------------------------------------------
# EC2 — BACKEND (Laravel + RDS)
# -----------------------------------------------------------------------

resource "aws_instance" "backend" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.backend_sg.id]

  user_data = templatefile("${path.module}/backend.sh", {
    db_host      = aws_db_instance.mysql.address
    db_name      = var.db_name
    db_user      = var.db_user
    db_password  = var.db_password
    repo_url     = var.repo_url
    repo_branch  = var.backend_branch
  })

  tags = { Name = "Backend" }
}

# -----------------------------------------------------------------------
# EC2 — FRONTEND (Angular + Apache)
# -----------------------------------------------------------------------

resource "aws_instance" "frontend" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.frontend_sg.id]

  user_data = templatefile("${path.module}/frontend.sh", {
    backend_ip    = aws_instance.backend.private_ip
    domain        = var.domain
    repo_url      = var.repo_url
    repo_branch   = var.frontend_branch
  })

  tags = { Name = "Frontend" }
}

resource "aws_eip" "frontend_eip" {
  domain   = "vpc"
  instance = aws_instance.frontend.id
  tags     = { Name = "frontend-eip" }
}

# -----------------------------------------------------------------------
# RDS — MySQL 8.0 (requisito adicional)
# -----------------------------------------------------------------------

resource "aws_db_subnet_group" "default" {
  name       = "bookshell-db-subnets"
  subnet_ids = data.aws_subnets.default.ids
  tags       = { Name = "bookshell-db-subnets" }
}

resource "aws_db_instance" "mysql" {
  identifier             = "bookshell-db"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  db_name                = var.db_name
  username               = var.db_user
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.default.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  skip_final_snapshot    = true
  publicly_accessible    = false
  tags                   = { Name = "bookshell-rds" }
}

# -----------------------------------------------------------------------
# ALB — Application Load Balancer (requisito adicional)
# -----------------------------------------------------------------------

resource "aws_lb" "frontend" {
  name               = "bookshell-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = data.aws_subnets.default.ids
  tags               = { Name = "bookshell-alb" }
}

resource "aws_lb_target_group" "frontend" {
  name     = "bookshell-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id

  health_check {
    path                = "/"
    interval            = 30
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200-399"
  }

  tags = { Name = "bookshell-tg" }
}

resource "aws_lb_target_group_attachment" "frontend" {
  target_group_arn = aws_lb_target_group.frontend.arn
  target_id        = aws_instance.frontend.id
  port             = 80
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.frontend.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# -----------------------------------------------------------------------
# OUTPUTS
# -----------------------------------------------------------------------

output "bastion_eip" {
  description = "IP publica del bastion — usa esta para SSH"
  value       = aws_eip.bastion_eip.public_ip
}

output "frontend_eip" {
  description = "IP publica del frontend — apunta bookshell.duckdns.org aqui"
  value       = aws_eip.frontend_eip.public_ip
}

output "frontend_private_ip" {
  description = "IP privada del frontend (SSH via bastion)"
  value       = aws_instance.frontend.private_ip
}

output "backend_private_ip" {
  description = "IP privada del backend (SSH via bastion)"
  value       = aws_instance.backend.private_ip
}

output "rds_endpoint" {
  description = "Endpoint del RDS MySQL"
  value       = aws_db_instance.mysql.address
}

output "alb_dns" {
  description = "DNS del Application Load Balancer"
  value       = aws_lb.frontend.dns_name
}
