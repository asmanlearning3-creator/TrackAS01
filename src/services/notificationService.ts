// Notification service for SMS, Email, and Push notifications
export class NotificationService {
  private static instance: NotificationService;
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // SMS Notifications (Twilio integration)
  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      // In production, integrate with Twilio API
      console.log(`SMS to ${to}: ${message}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  // Email Notifications
  async sendEmail(to: string, subject: string, body: string, template?: string): Promise<boolean> {
    try {
      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      console.log(`Email to ${to}: ${subject}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Push Notifications (Firebase Cloud Messaging)
  async sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<boolean> {
    try {
      // In production, integrate with Firebase Cloud Messaging
      console.log(`Push notification to ${userId}: ${title}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return true;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  // Shipment-specific notifications
  async notifyShipmentCreated(shipment: any): Promise<void> {
    const message = `Your shipment ${shipment.id} has been created and is awaiting operator assignment.`;
    
    await Promise.all([
      this.sendSMS(shipment.customer_phone, message),
      this.sendEmail(
        shipment.customer_email, 
        'Shipment Created - TrackAS',
        `Dear ${shipment.customer_name},\n\n${message}\n\nTrack your shipment: https://trackas.com/track/${shipment.id}`
      )
    ]);
  }

  async notifyShipmentAssigned(shipment: any, operator: any): Promise<void> {
    const customerMessage = `Your shipment ${shipment.id} has been assigned to ${operator.name}. Driver contact: ${operator.phone}`;
    const operatorMessage = `New shipment ${shipment.id} assigned to you. Pickup: ${shipment.pickup_address}`;
    
    await Promise.all([
      this.sendSMS(shipment.customer_phone, customerMessage),
      this.sendSMS(operator.phone, operatorMessage),
      this.sendEmail(
        shipment.customer_email,
        'Shipment Assigned - TrackAS',
        `Dear ${shipment.customer_name},\n\n${customerMessage}\n\nTrack live: https://trackas.com/track/${shipment.id}`
      )
    ]);
  }

  async notifyPickupCompleted(shipment: any): Promise<void> {
    const message = `Your shipment ${shipment.id} has been picked up and is now in transit.`;
    
    await Promise.all([
      this.sendSMS(shipment.customer_phone, message),
      this.sendPushNotification(shipment.customer_id, 'Package Picked Up', message)
    ]);
  }

  async notifyDeliveryCompleted(shipment: any): Promise<void> {
    const message = `Your shipment ${shipment.id} has been delivered successfully. Thank you for using TrackAS!`;
    
    await Promise.all([
      this.sendSMS(shipment.customer_phone, message),
      this.sendEmail(
        shipment.customer_email,
        'Delivery Completed - TrackAS',
        `Dear ${shipment.customer_name},\n\n${message}\n\nDownload invoice: https://trackas.com/invoice/${shipment.id}`
      )
    ]);
  }

  async notifyDeliveryDelay(shipment: any, newETA: string, reason: string): Promise<void> {
    const message = `Your shipment ${shipment.id} is delayed. New ETA: ${newETA}. Reason: ${reason}`;
    
    await Promise.all([
      this.sendSMS(shipment.customer_phone, message),
      this.sendPushNotification(shipment.customer_id, 'Delivery Delayed', message)
    ]);
  }

  // Operator notifications
  async notifyOperatorJobAvailable(operator: any, shipment: any): Promise<void> {
    const message = `New job available: ${shipment.id}. Pickup: ${shipment.pickup_address}. Earnings: ₹${shipment.estimated_earnings}`;
    
    await Promise.all([
      this.sendSMS(operator.phone, message),
      this.sendPushNotification(operator.id, 'New Job Available', message)
    ]);
  }

  async notifyOperatorPayment(operator: any, amount: number, shipmentId: string): Promise<void> {
    const message = `Payment of ₹${amount} for shipment ${shipmentId} has been processed to your account.`;
    
    await Promise.all([
      this.sendSMS(operator.phone, message),
      this.sendEmail(
        operator.email,
        'Payment Processed - TrackAS',
        `Dear ${operator.name},\n\n${message}\n\nView details: https://trackas.com/earnings`
      )
    ]);
  }

  // Admin notifications
  async notifyAdminDispute(dispute: any): Promise<void> {
    const message = `New dispute ${dispute.id} reported for shipment ${dispute.shipmentId}. Priority: ${dispute.priority}`;
    
    // Send to admin team
    await this.sendEmail(
      'admin@trackas.com',
      'New Dispute Reported - TrackAS',
      `${message}\n\nReview: https://trackas.com/admin/disputes/${dispute.id}`
    );
  }

  async notifyAdminRegistration(type: 'company' | 'vehicle', data: any): Promise<void> {
    const message = `New ${type} registration pending approval: ${data.name || data.registration_number}`;
    
    await this.sendEmail(
      'admin@trackas.com',
      `New ${type} Registration - TrackAS`,
      `${message}\n\nReview: https://trackas.com/admin/verification`
    );
  }

  // Bulk notifications
  async sendBulkNotification(userIds: string[], title: string, message: string, channels: ('sms' | 'email' | 'push')[] = ['push']): Promise<void> {
    const promises = userIds.map(async (userId) => {
      if (channels.includes('push')) {
        await this.sendPushNotification(userId, title, message);
      }
      // Add SMS and email if phone/email available
    });
    
    await Promise.all(promises);
  }

  // Template-based notifications
  async sendTemplateNotification(template: string, data: any, recipient: any): Promise<void> {
    const templates = {
      shipment_created: {
        sms: `Your shipment {{shipment_id}} has been created. Track: {{tracking_url}}`,
        email: {
          subject: 'Shipment Created - TrackAS',
          body: `Dear {{customer_name}},\n\nYour shipment {{shipment_id}} has been created and is being processed.\n\nTrack your shipment: {{tracking_url}}\n\nBest regards,\nTrackAS Team`
        }
      },
      delivery_approaching: {
        sms: `Your shipment {{shipment_id}} will be delivered in {{eta}} minutes.`,
        email: {
          subject: 'Delivery Approaching - TrackAS',
          body: `Dear {{customer_name}},\n\nYour shipment {{shipment_id}} is approaching and will be delivered in approximately {{eta}} minutes.\n\nPlease be available to receive your package.\n\nBest regards,\nTrackAS Team`
        }
      }
    };

    const templateData = templates[template as keyof typeof templates];
    if (!templateData) return;

    // Replace template variables
    const replacePlaceholders = (text: string) => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);
    };

    if (templateData.sms && recipient.phone) {
      await this.sendSMS(recipient.phone, replacePlaceholders(templateData.sms));
    }

    if (templateData.email && recipient.email) {
      await this.sendEmail(
        recipient.email,
        replacePlaceholders(templateData.email.subject),
        replacePlaceholders(templateData.email.body)
      );
    }
  }
}

export const notificationService = NotificationService.getInstance();