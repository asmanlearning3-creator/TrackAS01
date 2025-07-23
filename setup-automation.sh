#!/bin/bash

echo "🚀 Setting up automation for your React project..."

# Install dependencies including Husky
echo "📦 Installing dependencies..."
npm install

# Initialize Husky
echo "🪝 Setting up Git hooks with Husky..."
npx husky install

# Make sure the pre-commit hook is executable
chmod +x .husky/pre-commit

# Run initial checks to make sure everything works
echo "🔍 Running initial quality checks..."
npm run type-check
npm run lint
npm run build

echo "✅ Automation setup complete!"
echo ""
echo "📋 What's been set up:"
echo "  ✅ CI/CD Pipeline (.github/workflows/ci-cd.yml)"
echo "  ✅ Automated Dependency Updates (.github/workflows/dependency-updates.yml)"
echo "  ✅ Pre-commit hooks with Husky"
echo "  ✅ Enhanced npm scripts for automation"
echo ""
echo "🛠️  Available commands:"
echo "  npm run ci          - Run full CI pipeline locally"
echo "  npm run lint:fix    - Auto-fix linting issues"
echo "  npm run type-check  - Check TypeScript types"
echo "  npm run security-audit - Check for security vulnerabilities"
echo "  npm run outdated    - Check for outdated dependencies"
echo ""
echo "🎯 Next steps:"
echo "  1. Commit these changes to trigger the CI/CD pipeline"
echo "  2. Configure deployment secrets in GitHub repository settings"
echo "  3. Customize the deployment step in ci-cd.yml for your hosting platform"
echo "  4. Consider adding tests and update the 'test' script"