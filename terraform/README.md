# TruckFlow Infrastructure with Terraform

This directory contains Terraform configuration for deploying the TruckFlow application infrastructure to AWS.

## 🏗️ Infrastructure Components

The Terraform configuration creates:

- **S3 Bucket**: For static website hosting
- **CloudFront Distribution**: CDN for global content delivery
- **S3 Bucket Policy**: Public read access for website content
- **IAM Roles**: (Future) For application services

## 📋 Prerequisites

1. **Install Terraform**
   ```bash
   # For macOS
   brew install terraform
   
   # For Ubuntu/Debian
   wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
   echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
   sudo apt update && sudo apt install terraform
   
   # For Windows
   choco install terraform
   ```

2. **Configure AWS Credentials**
   ```bash
   # Using AWS CLI
   aws configure
   
   # Or set environment variables
   export AWS_ACCESS_KEY_ID="your-access-key"
   export AWS_SECRET_ACCESS_KEY="your-secret-key"
   export AWS_DEFAULT_REGION="us-east-1"
   ```

3. **Install AWS CLI** (optional but recommended)
   ```bash
   # For macOS
   brew install awscli
   
   # For Ubuntu/Debian
   sudo apt install awscli
   
   # For Windows
   choco install awscli
   ```

## 🚀 Quick Start

1. **Navigate to terraform directory**
   ```bash
   cd terraform
   ```

2. **Copy and customize variables**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

3. **Initialize Terraform**
   ```bash
   terraform init
   ```

4. **Plan the deployment**
   ```bash
   terraform plan
   ```

5. **Apply the configuration**
   ```bash
   terraform apply
   ```

6. **View outputs**
   ```bash
   terraform output
   ```

## 📝 Configuration Files

- `main.tf`: Main Terraform configuration
- `terraform.tfvars.example`: Example variables file
- `.gitignore`: Git ignore rules for Terraform files
- `README.md`: This documentation

## 🔧 Customization

### Variables

Edit `terraform.tfvars` to customize:

```hcl
# AWS Configuration
aws_region = "us-east-1"

# Environment Configuration
environment = "dev"  # dev, staging, prod

# Application Configuration
app_name = "truckflow"
```

### Multiple Environments

For multiple environments, create separate tfvars files:

```bash
# Development
terraform apply -var-file="dev.tfvars"

# Staging
terraform apply -var-file="staging.tfvars"

# Production
terraform apply -var-file="prod.tfvars"
```

## 📤 Deployment Workflow

### 1. Build the Application
```bash
# From project root
npm run build
```

### 2. Deploy to S3
```bash
# Get bucket name from Terraform output
BUCKET_NAME=$(terraform output -raw website_bucket_name)

# Sync build files to S3
aws s3 sync ../dist/ s3://$BUCKET_NAME --delete
```

### 3. Invalidate CloudFront Cache
```bash
# Get distribution ID from Terraform output
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)

# Create invalidation
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

## 🔍 Troubleshooting

### Common Issues

1. **"No configuration files" error**
   - Ensure you're in the `terraform/` directory
   - Make sure `main.tf` exists

2. **AWS credentials not configured**
   ```bash
   aws configure
   # Or set environment variables
   ```

3. **S3 bucket name conflicts**
   - Bucket names must be globally unique
   - Modify the `app_name` or `environment` variables

4. **Permission denied errors**
   - Check AWS IAM permissions
   - Ensure your user has necessary AWS permissions

### Terraform Commands

```bash
# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Plan changes
terraform plan

# Apply changes
terraform apply

# Show current state
terraform show

# List resources
terraform state list

# Destroy infrastructure
terraform destroy
```

## 🔒 Security Best Practices

1. **Never commit `.tfvars` files** containing sensitive data
2. **Use remote state storage** for production (S3 + DynamoDB)
3. **Enable versioning** on S3 buckets
4. **Use least privilege** IAM policies
5. **Enable AWS CloudTrail** for audit logging

## 📊 Outputs

After successful deployment, Terraform provides:

- `website_bucket_name`: S3 bucket name for uploads
- `website_url`: Direct S3 website URL
- `cloudfront_url`: CloudFront CDN URL (recommended)
- `cloudfront_distribution_id`: For cache invalidation

## 🔄 CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Deploy Infrastructure
on:
  push:
    branches: [main]

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: hashicorp/setup-terraform@v1
      
      - name: Terraform Init
        run: terraform init
        working-directory: terraform
        
      - name: Terraform Plan
        run: terraform plan
        working-directory: terraform
        
      - name: Terraform Apply
        run: terraform apply -auto-approve
        working-directory: terraform
```

## 💰 Cost Estimation

Approximate monthly costs (us-east-1):

- **S3 Storage**: ~$0.023/GB
- **CloudFront**: ~$0.085/GB for first 10TB
- **S3 Requests**: ~$0.0004/1000 GET requests
- **Total for small app**: ~$5-15/month

Use [AWS Pricing Calculator](https://calculator.aws/) for accurate estimates.

## 📞 Support

For infrastructure issues:
1. Check Terraform documentation
2. Review AWS service documentation  
3. Check CloudWatch logs for errors
4. Open an issue in this repository