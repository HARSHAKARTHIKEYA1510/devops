# Terraform Infrastructure Provisioning

This directory contains Terraform configuration for provisioning AWS infrastructure.

## Phase 2 Requirements

### ✅ S3 Bucket Configuration
- **Unique bucket name**: Configured via `bucket_name` variable
- **Versioning enabled**: Automatically enabled on bucket
- **Encryption enabled**: AES256 server-side encryption
- **Public access blocked**: All public access settings blocked

## Prerequisites

1. **Install Terraform**: Download from [terraform.io](https://www.terraform.io/downloads)
2. **AWS Credentials**: Set up AWS access key and secret key
3. **AWS CLI** (optional): For testing AWS connectivity

## Local Setup

### Step 1: Configure Variables

```bash
# Copy the example file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
nano terraform.tfvars
```

Update these values:
```hcl
aws_region  = "us-east-1"
bucket_name = "your-unique-bucket-name-12345"  # Must be globally unique
environment = "dev"
```

### Step 2: Initialize Terraform

```bash
cd terraform
terraform init
```

This will:
- Download required providers (AWS)
- Initialize the backend
- Prepare the working directory

### Step 3: Validate Configuration

```bash
terraform validate
```

This checks if the configuration is syntactically valid.

### Step 4: Plan Infrastructure

```bash
terraform plan
```

This shows what resources will be created without actually creating them.

### Step 5: Apply Infrastructure

```bash
terraform apply
```

Type `yes` when prompted to create the resources.

### Step 6: View Outputs

```bash
terraform output
```

This displays information about created resources.

## GitHub Actions Workflow

The Terraform workflow (`.github/workflows/terraform.yml`) automates infrastructure provisioning.

### Required GitHub Secrets

Add these secrets in your repository settings (Settings → Secrets and variables → Actions):

1. **`AWS_ACCESS_KEY_ID`**: Your AWS access key
2. **`AWS_SECRET_ACCESS_KEY`**: Your AWS secret key
3. **`S3_BUCKET_NAME`**: Unique S3 bucket name (e.g., `my-app-bucket-12345`)
4. **`AWS_REGION`** (optional): AWS region (default: `us-east-1`)
5. **`ENVIRONMENT`** (optional): Environment name (default: `dev`)

### Workflow Triggers

- **Push to main/master**: Runs plan and apply
- **Pull Request**: Runs plan only and comments on PR
- **Manual**: Can be triggered manually from Actions tab

### Workflow Steps

1. ✅ **Format Check**: Validates Terraform formatting
2. ✅ **Init**: Initializes Terraform
3. ✅ **Validate**: Validates configuration
4. ✅ **Plan**: Creates execution plan
5. ✅ **Apply**: Applies changes (only on main/master)
6. ✅ **Output**: Shows created resources

### Artifacts

All logs are uploaded as artifacts (30-day retention):
- `terraform-fmt-logs`
- `terraform-init-logs`
- `terraform-validate-logs`
- `terraform-plan-logs`
- `terraform-apply-logs`
- `terraform-output-logs`

## Useful Commands

```bash
# Format Terraform files
terraform fmt -recursive

# Show current state
terraform show

# List resources
terraform state list

# Destroy infrastructure (careful!)
terraform destroy

# View specific output
terraform output bucket_name
```

## S3 Bucket Features

### Versioning
- Keeps multiple versions of objects
- Protects against accidental deletion
- Enables recovery of deleted objects

### Encryption
- Server-side encryption with AES256
- Data encrypted at rest
- Automatic encryption for all objects

### Public Access Block
- Blocks all public ACLs
- Blocks public bucket policies
- Ignores public ACLs
- Restricts public buckets

## Troubleshooting

### Bucket Name Already Exists
S3 bucket names must be globally unique. Try adding random numbers or your organization name.

### AWS Credentials Error
Ensure your AWS credentials are correctly set:
```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
```

### Permission Denied
Ensure your AWS user has permissions for:
- `s3:CreateBucket`
- `s3:PutBucketVersioning`
- `s3:PutEncryptionConfiguration`
- `s3:PutBucketPublicAccessBlock`

## Clean Up

To destroy all created resources:

```bash
terraform destroy
```

Type `yes` when prompted. This will delete the S3 bucket and all configurations.

## Security Notes

- ⚠️ Never commit `terraform.tfvars` to git
- ⚠️ Never commit AWS credentials
- ⚠️ Use GitHub Secrets for CI/CD
- ✅ Always use encryption
- ✅ Always block public access
- ✅ Enable versioning for data protection
