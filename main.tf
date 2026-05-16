# Install Terraform
sudo apt install terraform -y
# main.tf
provider "aws" { region = "ap-south-1" }
resource "aws_instance" "app" {
  ami = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}