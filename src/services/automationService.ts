// Automation service for TrackAS platform
export class AutomationService {
  private static instance: AutomationService;
  
  public static getInstance(): AutomationService {
    if (!AutomationService.instance) {
      AutomationService.instance = new AutomationService();
    }
    return AutomationService.instance;
  }

  // VCODE-based automatic assignment for subscription model
  async autoAssignVehicle(shipment: any, companyVehicles: any[]): Promise<any> {
    try {
      // Filter available vehicles
      const availableVehicles = companyVehicles.filter(vehicle => 
        vehicle.status === 'verified' && 
        vehicle.availability === 'available' &&
        vehicle.capacity.weight >= shipment.weight
      );

      if (availableVehicles.length === 0) {
        throw new Error('No available vehicles for assignment');
      }

      // Sort by proximity and capacity efficiency
      const scoredVehicles = availableVehicles.map(vehicle => {
        let score = 0;
        
        // Capacity efficiency (prefer vehicles that match load size)
        const capacityUtilization = shipment.weight / vehicle.capacity.weight;
        score += capacityUtilization > 0.7 ? 50 : capacityUtilization > 0.4 ? 30 : 10;
        
        // Driver performance
        score += (vehicle.driver.rating || 4) * 10;
        
        // Vehicle type preference
        if (shipment.urgency === 'express' && vehicle.type === 'bike') score += 20;
        if (shipment.urgency === 'standard' && vehicle.type === 'truck') score += 15;
        
        return { ...vehicle, assignmentScore: score };
      });

      // Select best vehicle
      const bestVehicle = scoredVehicles.sort((a, b) => b.assignmentScore - a.assignmentScore)[0];
      
      return {
        vehicleId: bestVehicle.id,
        vcode: bestVehicle.vcode,
        operatorId: bestVehicle.operator_id,
        estimatedPickupTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        assignmentReason: 'Auto-assigned via VCODE system',
        confidence: Math.min(bestVehicle.assignmentScore, 100)
      };
    } catch (error) {
      console.error('Auto-assignment failed:', error);
      throw new Error('Failed to auto-assign vehicle');
    }
  }

  // AI-based operator matching for pay-per-shipment model
  async matchBestOperator(shipment: any, availableOperators: any[]): Promise<any> {
    try {
      if (availableOperators.length === 0) {
        throw new Error('No available operators for matching');
      }

      // Score operators based on multiple factors
      const scoredOperators = availableOperators.map(operator => {
        let score = 0;
        
        // Distance factor (closer is better)
        const distance = this.calculateDistance(
          shipment.pickup_location,
          operator.current_location
        );
        score += Math.max(0, 100 - distance * 2);
        
        // Performance factors
        score += operator.rating * 20; // Max 100 points for 5-star rating
        score += operator.on_time_rate; // Direct percentage
        score += Math.min(operator.total_deliveries * 0.5, 50); // Experience bonus
        
        // Specialization match
        if (shipment.special_handling && 
            operator.specializations.includes(shipment.special_handling)) {
          score += 50;
        }
        
        // Vehicle capacity match
        if (operator.vehicle && operator.vehicle.capacity.weight >= shipment.weight) {
          score += 30;
        }
        
        // Urgency handling capability
        if (shipment.urgency === 'express' && operator.specializations.includes('Express')) {
          score += 40;
        }
        
        return {
          ...operator,
          matchScore: Math.round(score),
          estimatedArrival: Math.round(distance / 40 * 60), // minutes
          distance: Math.round(distance)
        };
      });

      // Sort by score and return top matches
      const bestMatches = scoredOperators
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);

      return {
        primaryMatch: bestMatches[0],
        alternativeMatches: bestMatches.slice(1),
        matchingCriteria: {
          distance: true,
          performance: true,
          specialization: !!shipment.special_handling,
          capacity: true
        },
        confidence: bestMatches[0]?.matchScore > 200 ? 'high' : 
                    bestMatches[0]?.matchScore > 150 ? 'medium' : 'low'
      };
    } catch (error) {
      console.error('Operator matching failed:', error);
      throw new Error('Failed to match operator');
    }
  }

  // Automated notification system
  async sendAutomatedNotifications(event: string, data: any): Promise<void> {
    try {
      const notifications = this.getNotificationTemplates(event, data);
      
      // Send notifications to all relevant parties
      for (const notification of notifications) {
        await this.sendNotification(notification);
      }
    } catch (error) {
      console.error('Automated notification failed:', error);
    }
  }

  private getNotificationTemplates(event: string, data: any) {
    const templates = {
      shipment_created: [
        {
          recipient: data.customer,
          channel: ['sms', 'email'],
          title: 'Shipment Created',
          message: `Your shipment ${data.shipmentId} has been created and is being processed.`,
          data: { shipmentId: data.shipmentId, trackingUrl: `https://trackas.com/track/${data.shipmentId}` }
        },
        {
          recipient: data.company,
          channel: ['email', 'app'],
          title: 'New Shipment Created',
          message: `Shipment ${data.shipmentId} created and awaiting assignment.`,
          data: { shipmentId: data.shipmentId }
        }
      ],
      operator_assigned: [
        {
          recipient: data.operator,
          channel: ['sms', 'app'],
          title: 'New Shipment Assigned',
          message: `You have been assigned shipment ${data.shipmentId}. Pickup: ${data.pickupAddress}`,
          data: { shipmentId: data.shipmentId, pickupAddress: data.pickupAddress }
        },
        {
          recipient: data.customer,
          channel: ['sms', 'email'],
          title: 'Operator Assigned',
          message: `Your shipment ${data.shipmentId} has been assigned to ${data.operatorName}. Contact: ${data.operatorPhone}`,
          data: { shipmentId: data.shipmentId, operatorName: data.operatorName, operatorPhone: data.operatorPhone }
        }
      ],
      pickup_completed: [
        {
          recipient: data.customer,
          channel: ['sms', 'app'],
          title: 'Package Picked Up',
          message: `Your shipment ${data.shipmentId} has been picked up and is now in transit.`,
          data: { shipmentId: data.shipmentId }
        },
        {
          recipient: data.company,
          channel: ['app'],
          title: 'Pickup Completed',
          message: `Shipment ${data.shipmentId} picked up by ${data.operatorName}.`,
          data: { shipmentId: data.shipmentId, operatorName: data.operatorName }
        }
      ],
      delivery_completed: [
        {
          recipient: data.customer,
          channel: ['sms', 'email'],
          title: 'Delivery Completed',
          message: `Your shipment ${data.shipmentId} has been delivered successfully. Thank you for using TrackAS!`,
          data: { shipmentId: data.shipmentId, deliveryTime: data.deliveryTime }
        },
        {
          recipient: data.operator,
          channel: ['app'],
          title: 'Delivery Confirmed',
          message: `Delivery for shipment ${data.shipmentId} confirmed. Payment processing initiated.`,
          data: { shipmentId: data.shipmentId, earnings: data.earnings }
        }
      ]
    };

    return templates[event as keyof typeof templates] || [];
  }

  private async sendNotification(notification: any): Promise<void> {
    // Integration with notification services
    console.log('Sending notification:', notification);
    
    // Simulate notification sending
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Automated status updates based on GPS location
  async processLocationUpdate(operatorId: string, location: { lat: number; lng: number }, shipmentId?: string): Promise<void> {
    try {
      if (!shipmentId) return;

      // Get shipment details
      const shipment = await this.getShipmentDetails(shipmentId);
      if (!shipment) return;

      // Calculate progress based on location
      const totalDistance = this.calculateDistance(
        shipment.pickup_location,
        shipment.destination_location
      );
      
      const distanceFromPickup = this.calculateDistance(
        shipment.pickup_location,
        location
      );
      
      const progress = Math.min(Math.round((distanceFromPickup / totalDistance) * 100), 100);

      // Determine if status should be updated
      let newStatus = shipment.status;
      let updateMessage = '';

      if (shipment.status === 'assigned' && distanceFromPickup < 0.5) {
        newStatus = 'picked_up';
        updateMessage = 'Package picked up from origin';
      } else if (shipment.status === 'picked_up' && progress > 10) {
        newStatus = 'in_transit';
        updateMessage = 'Shipment in transit';
      } else if (shipment.status === 'in_transit') {
        const distanceToDestination = this.calculateDistance(
          location,
          shipment.destination_location
        );
        
        if (distanceToDestination < 0.5) {
          newStatus = 'delivered';
          updateMessage = 'Shipment delivered successfully';
        } else if (distanceToDestination < 5) {
          updateMessage = 'Approaching destination';
        }
      }

      // Update shipment if status changed
      if (newStatus !== shipment.status) {
        await this.updateShipmentStatus(shipmentId, newStatus, updateMessage);
        
        // Send automated notifications
        await this.sendAutomatedNotifications(`status_${newStatus}`, {
          shipmentId,
          status: newStatus,
          message: updateMessage,
          location
        });
      }
    } catch (error) {
      console.error('Location update processing failed:', error);
    }
  }

  // Automated payment processing
  async processPayment(shipmentId: string, model: 'subscription' | 'pay-per-shipment'): Promise<any> {
    try {
      if (model === 'subscription') {
        // For subscription model, just log the completion
        return {
          type: 'subscription_completion',
          shipmentId,
          message: 'Shipment completed under subscription plan',
          processed: true
        };
      }

      // For pay-per-shipment, calculate and process payment
      const shipment = await this.getShipmentDetails(shipmentId);
      const operator = await this.getOperatorDetails(shipment.operator_id);
      
      const paymentAmount = shipment.price || 0;
      const platformFee = paymentAmount * 0.1; // 10% platform fee
      const operatorShare = paymentAmount - platformFee;

      // Process payment
      const payment = {
        shipmentId,
        operatorId: shipment.operator_id,
        companyId: shipment.company_id,
        amount: paymentAmount,
        operatorShare,
        platformFee,
        status: 'processing',
        method: 'bank_transfer'
      };

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      payment.status = 'completed';
      
      // Send payment notifications
      await this.sendAutomatedNotifications('payment_processed', {
        operator,
        amount: operatorShare,
        shipmentId
      });

      return payment;
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw new Error('Failed to process payment');
    }
  }

  // Automated performance tracking
  async updatePerformanceMetrics(operatorId: string, shipmentId: string, deliverySuccess: boolean, onTime: boolean): Promise<void> {
    try {
      const operator = await this.getOperatorDetails(operatorId);
      
      // Calculate new metrics
      const newTotalDeliveries = operator.total_deliveries + 1;
      const newSuccessfulDeliveries = operator.successful_deliveries + (deliverySuccess ? 1 : 0);
      const newOnTimeDeliveries = Math.round((operator.on_time_rate / 100) * operator.total_deliveries) + (onTime ? 1 : 0);
      const newOnTimeRate = (newOnTimeDeliveries / newTotalDeliveries) * 100;
      
      // Update operator performance
      await this.updateOperatorPerformance(operatorId, {
        total_deliveries: newTotalDeliveries,
        successful_deliveries: newSuccessfulDeliveries,
        on_time_rate: Math.round(newOnTimeRate * 100) / 100
      });

      // Check for performance milestones
      if (newTotalDeliveries % 50 === 0) {
        await this.sendAutomatedNotifications('milestone_achieved', {
          operator,
          milestone: `${newTotalDeliveries} deliveries completed`,
          bonus: this.calculateMilestoneBonus(newTotalDeliveries)
        });
      }

      // Check for performance issues
      if (newOnTimeRate < 85 && newTotalDeliveries > 10) {
        await this.sendAutomatedNotifications('performance_alert', {
          operator,
          issue: 'On-time rate below 85%',
          recommendation: 'Performance improvement plan recommended'
        });
      }
    } catch (error) {
      console.error('Performance update failed:', error);
    }
  }

  // Automated route optimization
  async optimizeRoute(shipmentId: string, currentLocation: { lat: number; lng: number }, destination: { lat: number; lng: number }): Promise<any> {
    try {
      // Get real-time traffic and weather data
      const trafficData = await this.getTrafficData(currentLocation, destination);
      const weatherData = await this.getWeatherData(currentLocation);
      
      // Calculate optimal route
      const routes = [
        {
          name: 'Fastest Route',
          distance: Math.random() * 50 + 200,
          duration: Math.random() * 60 + 120,
          fuelCost: Math.random() * 200 + 400,
          tollCost: Math.random() * 100 + 50,
          trafficScore: Math.random() * 30 + 70,
          weatherScore: Math.random() * 20 + 80
        },
        {
          name: 'Most Economical',
          distance: Math.random() * 80 + 220,
          duration: Math.random() * 90 + 150,
          fuelCost: Math.random() * 150 + 300,
          tollCost: Math.random() * 50 + 20,
          trafficScore: Math.random() * 25 + 65,
          weatherScore: Math.random() * 25 + 75
        },
        {
          name: 'Balanced Route',
          distance: Math.random() * 60 + 210,
          duration: Math.random() * 75 + 135,
          fuelCost: Math.random() * 175 + 350,
          tollCost: Math.random() * 75 + 35,
          trafficScore: Math.random() * 20 + 75,
          weatherScore: Math.random() * 15 + 85
        }
      ];

      // Select best route based on shipment urgency
      let recommendedRoute;
      if (shipment.urgency === 'express') {
        recommendedRoute = routes.sort((a, b) => a.duration - b.duration)[0];
      } else if (shipment.urgency === 'standard') {
        recommendedRoute = routes.sort((a, b) => a.fuelCost - b.fuelCost)[0];
      } else {
        recommendedRoute = routes.sort((a, b) => (a.duration + a.fuelCost) - (b.duration + b.fuelCost))[0];
      }

      return {
        recommendedRoute,
        alternativeRoutes: routes.filter(r => r !== recommendedRoute),
        optimizationFactors: {
          traffic: trafficData,
          weather: weatherData,
          urgency: shipment.urgency
        },
        estimatedSavings: {
          time: Math.round(Math.random() * 30 + 10), // minutes
          fuel: Math.round(Math.random() * 200 + 50), // INR
          distance: Math.round(Math.random() * 20 + 5) // km
        }
      };
    } catch (error) {
      console.error('Route optimization failed:', error);
      throw new Error('Failed to optimize route');
    }
  }

  // Automated invoice generation
  async generateInvoice(shipmentId: string): Promise<any> {
    try {
      const shipment = await this.getShipmentDetails(shipmentId);
      const company = await this.getCompanyDetails(shipment.company_id);
      const customer = await this.getCustomerDetails(shipment.customer_id);

      const invoice = {
        id: `INV-${shipmentId}`,
        shipmentId,
        companyId: shipment.company_id,
        customerId: shipment.customer_id,
        companyDetails: {
          name: company.name,
          address: company.address,
          tin: company.tin,
          contact: company.primary_contact_email
        },
        customerDetails: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email
        },
        shipmentDetails: {
          from: shipment.pickup_address,
          to: shipment.destination_address,
          weight: shipment.weight,
          dimensions: shipment.dimensions,
          urgency: shipment.urgency
        },
        pricing: {
          baseAmount: shipment.price * 0.8,
          serviceFee: shipment.price * 0.1,
          gst: shipment.price * 0.1,
          totalAmount: shipment.price
        },
        dates: {
          created: shipment.created_at,
          delivered: shipment.actual_delivery,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        status: 'generated',
        generatedAt: new Date().toISOString()
      };

      // Send invoice to customer
      await this.sendAutomatedNotifications('invoice_generated', {
        customer,
        invoice,
        downloadUrl: `https://trackas.com/invoice/${invoice.id}`
      });

      return invoice;
    } catch (error) {
      console.error('Invoice generation failed:', error);
      throw new Error('Failed to generate invoice');
    }
  }

  // Automated analytics calculation
  async calculateDailyAnalytics(companyId?: string): Promise<any> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's data
      const shipments = await this.getShipmentsByDate(today, companyId);
      const operators = await this.getOperatorsByCompany(companyId);
      
      const analytics = {
        date: today,
        companyId,
        metrics: {
          totalShipments: shipments.length,
          completedShipments: shipments.filter(s => s.status === 'delivered').length,
          pendingShipments: shipments.filter(s => s.status === 'pending').length,
          inTransitShipments: shipments.filter(s => ['assigned', 'picked_up', 'in_transit'].includes(s.status)).length,
          successRate: shipments.length > 0 ? (shipments.filter(s => s.status === 'delivered').length / shipments.length) * 100 : 0,
          averageDeliveryTime: this.calculateAverageDeliveryTime(shipments.filter(s => s.status === 'delivered')),
          totalRevenue: shipments.reduce((sum, s) => sum + (s.price || 0), 0),
          activeOperators: operators.filter(o => o.status !== 'offline').length,
          operatorUtilization: this.calculateOperatorUtilization(operators),
          customerSatisfaction: this.calculateCustomerSatisfaction(shipments)
        },
        trends: {
          shipmentGrowth: Math.random() * 20 - 10, // -10% to +10%
          revenueGrowth: Math.random() * 25 - 5, // -5% to +20%
          efficiencyImprovement: Math.random() * 15 + 2 // 2% to 17%
        }
      };

      return analytics;
    } catch (error) {
      console.error('Analytics calculation failed:', error);
      throw new Error('Failed to calculate analytics');
    }
  }

  // Utility functions
  private calculateDistance(point1: any, point2: any): number {
    // Simple distance calculation (in production, use proper geospatial functions)
    const lat1 = point1.lat || 28.6139;
    const lng1 = point1.lng || 77.2090;
    const lat2 = point2.lat || 19.0760;
    const lng2 = point2.lng || 72.8777;
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private calculateMilestoneBonus(deliveries: number): number {
    return Math.floor(deliveries / 50) * 500; // ₹500 per 50 deliveries
  }

  private calculateAverageDeliveryTime(deliveredShipments: any[]): number {
    if (deliveredShipments.length === 0) return 0;
    
    const totalTime = deliveredShipments.reduce((sum, shipment) => {
      const created = new Date(shipment.created_at).getTime();
      const delivered = new Date(shipment.actual_delivery).getTime();
      return sum + (delivered - created);
    }, 0);
    
    return totalTime / deliveredShipments.length / (1000 * 60 * 60); // Convert to hours
  }

  private calculateOperatorUtilization(operators: any[]): number {
    if (operators.length === 0) return 0;
    
    const busyOperators = operators.filter(o => o.status === 'busy').length;
    return (busyOperators / operators.length) * 100;
  }

  private calculateCustomerSatisfaction(shipments: any[]): number {
    const ratedShipments = shipments.filter(s => s.customer_rating);
    if (ratedShipments.length === 0) return 0;
    
    const totalRating = ratedShipments.reduce((sum, s) => sum + s.customer_rating, 0);
    return (totalRating / ratedShipments.length / 5) * 100; // Convert to percentage
  }

  // Mock data access methods (in production, these would be actual database calls)
  private async getShipmentDetails(shipmentId: string): Promise<any> {
    // Mock shipment data
    return {
      id: shipmentId,
      status: 'in_transit',
      pickup_location: { lat: 28.6139, lng: 77.2090 },
      destination_location: { lat: 19.0760, lng: 72.8777 },
      pickup_address: 'Delhi, India',
      destination_address: 'Mumbai, India',
      weight: 25,
      price: 2500,
      urgency: 'standard',
      operator_id: 'OP-001',
      company_id: 'COMP-001',
      customer_id: 'CUST-001',
      created_at: new Date().toISOString(),
      actual_delivery: null
    };
  }

  private async getOperatorDetails(operatorId: string): Promise<any> {
    return {
      id: operatorId,
      name: 'Amit Singh',
      phone: '+91-9876543210',
      email: 'amit.singh@email.com',
      rating: 4.9,
      total_deliveries: 67,
      successful_deliveries: 65,
      on_time_rate: 98
    };
  }

  private async getCompanyDetails(companyId: string): Promise<any> {
    return {
      id: companyId,
      name: 'ABC Logistics',
      address: 'Delhi, India',
      tin: 'TIN123456789',
      primary_contact_email: 'contact@abclogistics.com'
    };
  }

  private async getCustomerDetails(customerId: string): Promise<any> {
    return {
      id: customerId,
      name: 'Rajesh Kumar',
      phone: '+91-9876543210',
      email: 'rajesh.kumar@email.com'
    };
  }

  private async updateShipmentStatus(shipmentId: string, status: string, message: string): Promise<void> {
    console.log(`Updating shipment ${shipmentId} to ${status}: ${message}`);
  }

  private async updateOperatorPerformance(operatorId: string, metrics: any): Promise<void> {
    console.log(`Updating operator ${operatorId} performance:`, metrics);
  }

  private async getShipmentsByDate(date: string, companyId?: string): Promise<any[]> {
    // Mock data
    return [];
  }

  private async getOperatorsByCompany(companyId?: string): Promise<any[]> {
    // Mock data
    return [];
  }

  private async getTrafficData(from: any, to: any): Promise<any> {
    return {
      level: 'moderate',
      incidents: 1,
      averageSpeed: 55,
      congestionScore: 65
    };
  }

  private async getWeatherData(location: any): Promise<any> {
    return {
      condition: 'clear',
      temperature: 28,
      visibility: 10,
      windSpeed: 12
    };
  }
}

export const automationService = AutomationService.getInstance();