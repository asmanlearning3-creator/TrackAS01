#!/bin/bash

# TruckFlow Terraform Setup Script
# This script demonstrates how to properly use Terraform

set -e

echo "🚀 TruckFlow Infrastructure Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [[ ! -f "main.tf" ]]; then
    print_error "main.tf not found. Please run this script from the terraform/ directory."
    exit 1
fi

print_success "Found Terraform configuration files"

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    print_error "Terraform is not installed"
    echo ""
    echo "Please install Terraform first:"
    echo "  macOS:        brew install terraform"
    echo "  Ubuntu:       sudo apt install terraform"
    echo "  Windows:      choco install terraform"
    echo "  Or visit:     https://www.terraform.io/downloads"
    exit 1
fi

print_success "Terraform is installed: $(terraform version --short)"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_warning "AWS CLI is not installed (optional but recommended)"
    echo "  Install with: brew install awscli (macOS) or sudo apt install awscli (Ubuntu)"
else
    print_success "AWS CLI is installed: $(aws --version)"
fi

# Check if terraform.tfvars exists
if [[ ! -f "terraform.tfvars" ]]; then
    print_warning "terraform.tfvars not found"
    echo ""
    print_status "Creating terraform.tfvars from example..."
    cp terraform.tfvars.example terraform.tfvars
    print_success "Created terraform.tfvars - please edit it with your values"
    echo ""
    echo "Edit the following file:"
    echo "  terraform.tfvars"
    echo ""
    echo "Required changes:"
    echo "  - aws_region: Your preferred AWS region"
    echo "  - environment: dev, staging, or prod"
    echo "  - app_name: Your application name (must be globally unique for S3)"
else
    print_success "terraform.tfvars exists"
fi

# Check AWS credentials
print_status "Checking AWS credentials..."
if aws sts get-caller-identity &> /dev/null; then
    print_success "AWS credentials are configured"
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    AWS_REGION=$(aws configure get region || echo "not set")
    echo "  Account: $AWS_ACCOUNT"
    echo "  Region:  $AWS_REGION"
else
    print_warning "AWS credentials not configured"
    echo ""
    echo "Configure AWS credentials:"
    echo "  aws configure"
    echo ""
    echo "Or set environment variables:"
    echo "  export AWS_ACCESS_KEY_ID=your-access-key"
    echo "  export AWS_SECRET_ACCESS_KEY=your-secret-key"
    echo "  export AWS_DEFAULT_REGION=us-east-1"
fi

echo ""
print_status "Next steps:"
echo ""
echo "1. Configure AWS credentials (if not done):"
echo "   aws configure"
echo ""
echo "2. Edit terraform.tfvars with your values"
echo ""
echo "3. Initialize Terraform:"
echo "   terraform init"
echo ""
echo "4. Plan the deployment:"
echo "   terraform plan"
echo ""
echo "5. Apply the configuration:"
echo "   terraform apply"
echo ""
echo "6. View outputs:"
echo "   terraform output"
echo ""

# Demonstrate the fix for the original error
echo ""
print_status "🔧 Fix for 'No configuration files' error:"
echo ""
echo "The original error occurred because:"
echo "❌ terraform plan was run from: $(dirname $(pwd))"
echo "✅ terraform plan should be run from: $(pwd)"
echo ""
echo "Always ensure you're in the directory containing your .tf files!"
echo ""

print_success "Setup script completed!"
echo ""
echo "For more information, see: ./README.md"