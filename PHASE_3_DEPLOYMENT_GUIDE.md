# Phase 3 Deployment Guide (AWS Academy Learner Lab)

I have created all the necessary files for Phase 3. Here is the step-by-step workflow to deploy your containerized frontend and backend to ECS using your AWS Academy Learner Lab account.

## Overview of Changes Made
1. **Dockerfiles**: Updated `frontend/Dockerfile` and `backend/Dockerfile` to use **multi-stage builds**, **non-root users**, and configured **Healthchecks**.
2. **Terraform ECR** (`terraform/ecr.tf`): Created separate repositories for `frontend` and `backend`.
3. **Terraform ECS** (`terraform/ecs.tf`): Configured the ECS Cluster, separate Fargate Task Definitions for Frontend and Backend (using `LabRole`), and ECS Services.
4. **Terraform VPC & Security Group** (`terraform/vpc.tf`): Configured networking and security rules for ports 3000 and 5050.

## Deployment Steps

Because of how ECS and ECR work, you cannot launch an ECS Service if the ECR image does not exist yet. Follow this exact order:

### 1. Provision Infrastructure (Terraform)
First, apply the Terraform to create the S3 buckets, ECR repositories, and ECS Cluster.
```bash
cd terraform
terraform init
terraform apply -auto-approve
```
*Note: Your ECS Services will be created, but the tasks will temporarily fail to start because the Docker images haven't been pushed yet. This is normal.*

### 2. Login to ECR
Get your ECR login password and authenticate Docker. Replace `<region>` (e.g., `us-east-1`) and `<aws_account_id>` with your details.
```bash
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<region>.amazonaws.com
```

### 3. Build and Push Backend Image
```bash
cd ../backend

# Retrieve the ECR repository URL from terraform output
BACKEND_REPO=$(terraform -chdir=../terraform output -raw backend_repo_url)

# Build the image
docker build -t devops-backend .

# Tag the image
docker tag devops-backend:latest $BACKEND_REPO:latest

# Push to ECR
docker push $BACKEND_REPO:latest
```

### 4. Build and Push Frontend Image
```bash
cd ../frontend

# Retrieve the ECR repository URL from terraform output
FRONTEND_REPO=$(terraform -chdir=../terraform output -raw frontend_repo_url)

# Build the image
docker build -t devops-frontend .

# Tag the image
docker tag devops-frontend:latest $FRONTEND_REPO:latest

# Push to ECR
docker push $FRONTEND_REPO:latest
```

### 5. Force ECS to Deploy the New Images
Now that the images are in ECR, force the ECS services to start tasks using the new images.
```bash
aws ecs update-service --cluster devops-cluster --service devops-backend-service --force-new-deployment --region <region>

aws ecs update-service --cluster devops-cluster --service devops-frontend-service --force-new-deployment --region <region>
```

## Verifying the Deployment
1. Go to the **AWS Management Console** -> **ECS**.
2. Click on the `devops-cluster`.
3. Check the `devops-backend-service` and `devops-frontend-service`. The tasks should reach the `RUNNING` state.
4. Click on a running task, go to the **Networking** tab, and copy the **Public IP**.
5. Visit `http://<FRONTEND_PUBLIC_IP>:3000` to see your frontend, and `http://<BACKEND_PUBLIC_IP>:5050/api/health` to verify your backend!
