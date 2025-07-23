# 📱 Slack Notifications Setup Guide

This guide explains how to configure Slack notifications for your CI/CD pipeline.

## 🚨 **Current Issue**

You're seeing this error:

```
Error: Specify secrets.SLACK_WEBHOOK_URL
```

This happens because the GitHub Actions workflow is trying to send Slack notifications but the webhook URL secret is not configured.

## ✅ **Quick Fix Options**

### **Option 1: Disable Slack Notifications (Immediate Fix)**

If you don't need Slack notifications right now, you can disable them by commenting out or removing the Slack notification steps in your workflows.

### **Option 2: Configure Slack Webhook (Recommended)**

Follow the steps below to set up proper Slack integration.

## 🔧 **Complete Slack Setup**

### **Step 1: Create a Slack App**

1. **Go to Slack API**: https://api.slack.com/apps
2. **Click "Create New App"**
3. **Choose "From scratch"**
4. **Enter App Name**: "GitHub CI/CD Notifications"
5. **Select your Slack workspace**
6. **Click "Create App"**

### **Step 2: Enable Incoming Webhooks**

1. **In your app settings**, go to "Incoming Webhooks"
2. **Toggle "Activate Incoming Webhooks"** to ON
3. **Click "Add New Webhook to Workspace"**
4. **Select the channel** where you want notifications
5. **Click "Allow"**
6. **Copy the Webhook URL** (starts with `https://hooks.slack.com/...`)

### **Step 3: Add Secret to GitHub Repository**

1. **Go to your GitHub repository**
2. **Navigate to**: Settings → Secrets and variables → Actions
3. **Click "New repository secret"**
4. **Name**: `SLACK_WEBHOOK_URL`
5. **Value**: Paste the webhook URL from Step 2
6. **Click "Add secret"**

### **Step 4: Test the Configuration**

Push a commit or create a pull request to trigger the workflow and test the Slack notification.

## 🎨 **Notification Features**

Once configured, you'll receive Slack notifications with:

- ✅ **Success/Failure Status** with color-coded messages
- 📊 **Workflow Details** (name, branch, repository)
- 🔗 **Direct Links** to workflow runs
- 📝 **Custom Messages** for different events

### **Example Notification:**

```
✅ CI/CD Pipeline workflow success on branch `main`

Repository: your-org/truckflow
Branch: main

[View Workflow Run] (button link)
```

## 🔧 **Advanced Configuration**

### **Custom Notification Channels**

You can create different webhooks for different types of notifications:

```yaml
# In your workflow file
env:
  SLACK_WEBHOOK_URL_SUCCESS: ${{ secrets.SLACK_WEBHOOK_URL_SUCCESS }}
  SLACK_WEBHOOK_URL_FAILURE: ${{ secrets.SLACK_WEBHOOK_URL_FAILURE }}
```

### **Conditional Notifications**

Only notify on specific events:

```yaml
# Only notify on main branch
if: github.ref == 'refs/heads/main'

# Only notify on failure
if: failure()

# Only notify on success
if: success()
```

### **Custom Message Templates**

Customize the notification message:

```yaml
- name: Custom Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: custom
    custom_payload: |
      {
        "text": "🚀 Deployment completed!",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*TruckFlow* has been successfully deployed to production!"
            }
          }
        ]
      }
```

## 📋 **Required GitHub Secrets**

Add these secrets to your repository:

| Secret Name                 | Description                | Required |
| --------------------------- | -------------------------- | -------- |
| `SLACK_WEBHOOK_URL`         | Main Slack webhook URL     | Yes      |
| `SLACK_WEBHOOK_URL_SUCCESS` | Success-only notifications | Optional |
| `SLACK_WEBHOOK_URL_FAILURE` | Failure-only notifications | Optional |

## 🔍 **Troubleshooting**

### **Common Issues:**

#### **1. "Webhook URL not found" Error**

- ✅ **Solution**: Check that the secret name exactly matches `SLACK_WEBHOOK_URL`
- Verify the secret is added to the correct repository

#### **2. "Invalid webhook URL" Error**

- ✅ **Solution**: Ensure the webhook URL is complete and starts with `https://hooks.slack.com/`
- Re-create the webhook if necessary

#### **3. "Permission denied" Error**

- ✅ **Solution**: Check that the Slack app has permission to post to the selected channel
- Re-authorize the app if needed

#### **4. "No notifications received"**

- ✅ **Solution**:
  - Check the Slack channel permissions
  - Verify the workflow is actually running
  - Check GitHub Actions logs for errors

### **Testing Webhook URL**

Test your webhook URL manually:

```bash
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"Test notification from GitHub Actions"}' \
YOUR_WEBHOOK_URL
```

## 🚫 **Disabling Notifications Temporarily**

If you need to disable notifications temporarily:

### **Method 1: Environment Variable**

Add this to your repository variables:

- Name: `SLACK_NOTIFICATIONS_ENABLED`
- Value: `false`

### **Method 2: Comment Out Workflow Steps**

```yaml
# - name: Notify Slack
#   uses: 8398a7/action-slack@v3
#   with:
#     status: ${{ job.status }}
#     webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### **Method 3: Conditional Execution**

```yaml
if: secrets.SLACK_WEBHOOK_URL != ''
```

## 🎯 **Best Practices**

1. **🔒 Security**: Never commit webhook URLs to your repository
2. **📢 Channel Selection**: Use dedicated channels for CI/CD notifications
3. **🎛️ Noise Reduction**: Only notify on important events (failures, deployments)
4. **📝 Clear Messages**: Include relevant context (branch, commit, logs)
5. **🔄 Testing**: Test notifications in development before production

## 📞 **Support**

If you're still having issues:

1. **Check GitHub Actions logs** for detailed error messages
2. **Verify Slack app permissions** in your workspace
3. **Test webhook URL** using curl command above
4. **Review workflow YAML** for syntax errors

## 📚 **Additional Resources**

- [Slack API Documentation](https://api.slack.com/messaging/webhooks)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [action-slack GitHub Repository](https://github.com/8398a7/action-slack)

---

**🎉 Once configured, you'll have automatic Slack notifications for all your CI/CD pipeline events!**
