data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_security_group" "ecs_tasks" {
  name        = "devops-ecs-tasks-sg"
  description = "Allow inbound access for ECS tasks"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    protocol    = "tcp"
    from_port   = 3000
    to_port     = 3000
    cidr_blocks = ["0.0.0.0/0"]
    description = "Frontend port"
  }

  ingress {
    protocol    = "tcp"
    from_port   = 5050
    to_port     = 5050
    cidr_blocks = ["0.0.0.0/0"]
    description = "Backend port"
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
}
