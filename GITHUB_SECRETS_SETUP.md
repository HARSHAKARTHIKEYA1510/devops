# GitHub Secrets and Variables Setup Guide

This document lists all the secrets and variables you need to add to your GitHub repository for the CI/CD pipelines to work.

## How to Add Secrets and Variables

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets and variables

---

## 🔐 Required Secrets (Sensitive Data)

### For Terraform Workflow

| Secret Name | Description | Example Value | Required |
|------------|-------------|---------------|----------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key ID | `AKIAIOSFODNN7EXAMPLE` | ✅ Yes |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret access key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | ✅ Yes |
| `AWS_SESSION_TOKEN` | AWS session token (for temporary credentials) | `FwoGZXIvYXdzEBYaD...` | ⚠️ Optional* |

**⚠️ Important:** 
- Never commit these values to your repository
- Keep them secure and rotate them regularly
- These are used to authenticate with AWS
- *`AWS_SESSION_TOKEN` is only required if you're using temporary AWS credentials (e.g., AWS Academy, AWS SSO, or assumed roles)

---

## 📝 Required Variables (Non-Sensitive Configuration)

### For Terraform Workflow

| Variable Name | Description | Example Value | Required | Default |
|--------------|-------------|---------------|----------|---------|
| `S3_BUCKET_NAME` | Unique S3 bucket name (globally unique) | `my-devops-app-bucket-12345` | ✅ Yes | None |
| `AWS_REGION` | AWS region for resources | `us-east-1` | ❌ No | `us-east-1` |
| `ENVIRONMENT` | Environment name | `dev`, `staging`, or `prod` | ❌ No | `dev` |

**💡 Tips for S3_BUCKET_NAME:**
- Must be globally unique across all AWS accounts
- Use lowercase letters, numbers, and hyphens only
- Between 3-63 characters
- Example format: `{project-name}-{environment}-{random-number}`
- Good example: `ecommerce-app-dev-98765`

---

## 📋 Step-by-Step Setup Instructions

### Step 1: Add Secrets

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add each secret:

**Secret 1:**
- Name: `AWS_ACCESS_KEY_ID`
- Value: Your AWS access key ID
- Click **"Add secret"**

**Secret 2:**
- Name: `AWS_SECRET_ACCESS_KEY`
- Value: Your AWS secret access key
- Click **"Add secret"**

**Secret 3 (Optional - only if using temporary credentials):**
- Name: `AWS_SESSION_TOKEN`
- Value: Your AWS session token
- Click **"Add secret"**

### Step 2: Add Variables

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click the **"Variables"** tab
3. Click **"New repository variable"**
4. Add each variable:

**Variable 1:**
- Name: `S3_BUCKET_NAME`
- Value: Your unique bucket name (e.g., `my-app-bucket-12345`)
- Click **"Add variable"**

**Variable 2 (Optional):**
- Name: `AWS_REGION`
- Value: `us-east-1` (or your preferred region)
- Click **"Add variable"**

**Variable 3 (Optional):**
- Name: `ENVIRONMENT`
- Value: `dev` (or `staging`, `prod`)
- Click **"Add variable"**

---

## 🔍 How to Get AWS Credentials

### Option 1: AWS IAM Console (Recommended for Permanent Credentials)

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Go to **IAM** → **Users**
3. Click **"Create user"** or select existing user
4. Go to **Security credentials** tab
5. Click **"Create access key"**
6. Select **"Command Line Interface (CLI)"**
7. Copy the **Access Key ID** and **Secret Access Key**
8. ⚠️ Save them securely - you won't see the secret key again!

**Note:** This creates permanent credentials (no session token needed).

### Option 2: AWS Academy / AWS Learner Lab (Temporary Credentials)

1. Log in to AWS Academy
2. Click **"AWS Details"** or **"AWS CLI"**
3. Click **"Show"** next to AWS CLI credentials
4. Copy all three values:
   - `aws_access_key_id`
   - `aws_secret_access_key`
   - `aws_session_token` ⚠️ **Required for temporary credentials**

**Note:** These credentials expire (usually after 3-4 hours). You'll need to update them regularly.

### Option 3: AWS CLI

If you already have AWS CLI configured:

```bash
cat ~/.aws/credentials
```

Look for:
```
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
aws_session_token = YOUR_SESSION_TOKEN  # Only present for temporary credentials
```

---

## 🛡️ Required AWS IAM Permissions

Your AWS user needs these permissions for Terraform to work:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:GetBucketVersioning",
        "s3:PutBucketVersioning",
        "s3:GetEncryptionConfiguration",
        "s3:PutEncryptionConfiguration",
        "s3:GetBucketPublicAccessBlock",
        "s3:PutBucketPublicAccessBlock",
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:GetBucketTagging",
        "s3:PutBucketTagging"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## ✅ Verification Checklist

After adding all secrets and variables, verify:

- [ ] `AWS_ACCESS_KEY_ID` secret is added
- [ ] `AWS_SECRET_ACCESS_KEY` secret is added
- [ ] `AWS_SESSION_TOKEN` secret is added (if using temporary credentials)
- [ ] `S3_BUCKET_NAME` variable is added with a unique name
- [ ] `AWS_REGION` variable is added (optional, defaults to us-east-1)
- [ ] `ENVIRONMENT` variable is added (optional, defaults to dev)
- [ ] AWS credentials have required S3 permissions
- [ ] S3 bucket name is globally unique

---

## 🧪 Test Your Setup

After adding secrets and variables:

1. Go to **Actions** tab in your repository
2. Click on **"Terraform Infrastructure Provisioning"** workflow
3. Click **"Run workflow"** → **"Run workflow"**
4. Watch the workflow run
5. Check the logs for any errors

If successful, you should see:
- ✅ Terraform Init completed
- ✅ Terraform Validate passed
- ✅ Terraform Plan created
- ✅ Terraform Apply completed (on main/master branch)

---

## 🚨 Troubleshooting

### Error: "No valid credential sources found"
- **Solution:** Check that `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` secrets are correctly added

### Error: "BucketAlreadyExists"
- **Solution:** Change `S3_BUCKET_NAME` to a different unique name

### Error: "Access Denied"
- **Solution:** Verify your AWS user has the required S3 permissions listed above

### Error: "Invalid bucket name"
- **Solution:** Ensure bucket name:
  - Is lowercase
  - Contains only letters, numbers, and hyphens
  - Is between 3-63 characters
  - Doesn't start or end with a hyphen

---

## 🔄 Updating Secrets/Variables

To update a secret or variable:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click on the secret/variable name
3. Click **"Update secret"** or **"Update variable"**
4. Enter the new value
5. Click **"Update secret"** or **"Update variable"**

---

## 🗑️ Removing Secrets/Variables

To remove a secret or variable:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click on the secret/variable name
3. Click **"Remove secret"** or **"Remove variable"**
4. Confirm the deletion

---

## 📚 Additional Resources

- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [S3 Bucket Naming Rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html)
