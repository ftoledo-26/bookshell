variable "region" {
    description = "Value of the AWS region"
    type = string
    default = "us-east-1"
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners = ["099720109477"]
  filter {
    name = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
  filter {
    name = "virtualization-type"
    values = ["hvm"]
  }
}

variable "instance_type" {
  description = "instance Type"
  type = string
  default = "t2.micro"
}

variable "key_name" {
  description = "Key name for SSH access"
  type = string
  default = "vockey"
}