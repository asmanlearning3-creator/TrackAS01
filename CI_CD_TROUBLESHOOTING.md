# 🔧 CI/CD Troubleshooting Guide

This guide covers common CI/CD pipeline issues and their solutions.

## 🚨 **Issues Resolved**

### ✅ **Issue 1: Slack Webhook URL Missing**
```
Error: Specify secrets.SLACK_WEBHOOK_URL
```

**Root Cause**: GitHub Actions workflow trying to send Slack notifications without configured webhook URL.

**Solutions Implemented**:
1. **Conditional Notifications**: Added checks for webhook URL existence
2. **Graceful Degradation**: Workflow continues even if Slack notification fails
3. **Clear Error Messages**: Informative logs when webhook is not configured
4. **Setup Guide**: Complete Slack configuration documentation

### ✅ **Issue 2: Prettier Formatting Errors**
```
Code style issues found in 42 files. Run Prettier with --write to fix.
```

**Root Cause**: Code files not formatted according to Prettier rules.

**Solutions Implemented**:
1. **Automatic Formatting**: Ran `prettier --write .` to fix all issues
2. **Corrupted File Removal**: Deleted `src/components/App.tsx` with git diff markers
3. **Verification**: Confirmed all files now pass Prettier checks

## 🛠️ **Quick Fixes Reference**

### **Slack Notifications**

#### **Option 1: Disable Temporarily**
```yaml
# Comment out Slack notification steps
# - name: Notify Slack
#   uses: 8398a7/action-slack@v3
```

#### **Option 2: Make Optional**
```yaml
- name: Notify Slack
  if: secrets.SLACK_WEBHOOK_URL != ''
  uses: 8398a7/action-slack@v3
```

#### **Option 3: Configure Properly**
1. Create Slack app and webhook
2. Add `SLACK_WEBHOOK_URL` secret to GitHub repository
3. See `SLACK_SETUP_GUIDE.md` for detailed instructions

### **Code Formatting**

#### **Fix All Formatting Issues**
```bash
npx prettier --write .
```

#### **Check Formatting (CI/CD)**
```bash
npx prettier --check .
```

#### **Auto-format on Commit (Recommended)**
Add to `package.json`:
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json,css,md}": ["prettier --write", "git add"]
  }
}
```

## 📋 **CI/CD Workflow Features**

### **Current Workflows**
1. **ci-cd.yml**: Main pipeline with testing, building, and notifications
2. **notification-automation.yml**: Centralized notification handling
3. **terraform.yml**: Infrastructure deployment

### **Key Features**
- ✅ **Code Quality Checks**: ESLint, Prettier, TypeScript
- ✅ **Testing**: Automated test execution
- ✅ **Building**: Application build and artifact upload
- ✅ **Notifications**: Optional Slack integration
- ✅ **Error Handling**: Graceful failure handling

## 🔍 **Common CI/CD Issues & Solutions**

### **1. Node.js/npm Issues**

#### **Problem**: `npm ci` fails
```bash
npm ERR! Cannot read properties of null (reading 'pickAlgorithm')
```

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
npm install

# Use specific Node.js version
- uses: actions/setup-node@v4
  with:
    node-version: '18'
```

### **2. Build Failures**

#### **Problem**: TypeScript compilation errors
```bash
error TS2307: Cannot find module
```

**Solutions**:
```bash
# Check imports and paths
# Ensure all dependencies are installed
npm install --save-dev @types/node

# Add to tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

### **3. Test Failures**

#### **Problem**: Tests fail in CI but pass locally
```bash
Test suite failed to run
```

**Solutions**:
```bash
# Add test environment setup
export NODE_ENV=test

# Install test dependencies
npm install --save-dev @testing-library/jest-dom

# Update test configuration
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts']
};
```

### **4. Permissions Issues**

#### **Problem**: GitHub Actions permission denied
```bash
Permission denied (publickey)
```

**Solutions**:
```yaml
# Add proper permissions
permissions:
  contents: read
  actions: read
  security-events: write

# Use GITHUB_TOKEN
- uses: actions/checkout@v4
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```

### **5. Secret Management**

#### **Problem**: Secrets not accessible
```bash
Error: Input required and not supplied: webhook_url
```

**Solutions**:
```bash
# Check secret name exactly matches
secrets.SLACK_WEBHOOK_URL  # ✅ Correct
secrets.slack_webhook_url  # ❌ Wrong case

# Add conditional check
if: secrets.SLACK_WEBHOOK_URL != ''

# Test secret locally (for debugging)
echo "Secret exists: ${{ secrets.SLACK_WEBHOOK_URL != '' }}"
```

## 🚀 **Performance Optimization**

### **Speed Up CI/CD**

#### **1. Cache Dependencies**
```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

#### **2. Parallel Jobs**
```yaml
jobs:
  test:
    strategy:
      matrix:
        node-version: [16, 18, 20]
    runs-on: ubuntu-latest
```

#### **3. Skip Redundant Steps**
```yaml
- name: Skip if no code changes
  if: "!contains(github.event.head_commit.message, '[skip ci]')"
```

## 🔒 **Security Best Practices**

### **1. Secret Management**
- ✅ Use GitHub Secrets for sensitive data
- ✅ Never log secret values
- ✅ Use least privilege permissions
- ✅ Rotate secrets regularly

### **2. Dependencies**
```yaml
# Security audit
- name: Run security audit
  run: npm audit --audit-level=high

# Dependency updates
- name: Check for updates
  run: npx npm-check-updates
```

### **3. Code Scanning**
```yaml
# Add CodeQL analysis
- name: Initialize CodeQL
  uses: github/codeql-action/init@v2
  with:
    languages: javascript
```

## 📊 **Monitoring & Debugging**

### **1. Workflow Logs**
```bash
# View detailed logs
echo "::debug::Debug message"
echo "::warning::Warning message"
echo "::error::Error message"
```

### **2. Artifact Collection**
```yaml
- name: Upload logs
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: failure-logs
    path: |
      **/*.log
      **/npm-debug.log*
```

### **3. Notification Setup**
```yaml
# Comprehensive notification
- name: Notify on failure
  if: failure()
  run: |
    echo "Job failed: ${{ github.job }}"
    echo "Workflow: ${{ github.workflow }}"
    echo "Run URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
```

## 📚 **Resources & Documentation**

### **GitHub Actions**
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Action Marketplace](https://github.com/marketplace?type=actions)
- [Secrets Management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

### **Tools Documentation**
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Jest Testing](https://jestjs.io/docs/getting-started)

### **Project-Specific Guides**
- `SLACK_SETUP_GUIDE.md` - Slack notification setup
- `TERRAFORM_SOLUTION.md` - Infrastructure deployment
- `README.md` - Project overview and setup

---

**🎯 Keep this guide updated as you encounter and resolve new CI/CD issues!**