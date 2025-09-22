import { supabase } from '../lib/supabase';
import { escrowService } from './escrowService';

export interface AssignmentRequest {
  shipmentId: string;
  pickupLocation: { lat: number; lng: number };
  destinationLocation: { lat: number; lng: number };
  vehicleType: string;
  weight: number;
  urgency: 'standard' | 'urgent' | 'express';
  specialHandling?: string;
  price: number;
  shipperId: string;
}

export interface AssignmentResult {
  success: boolean;
  assignedTo?: {
    type: 'fleet' | 'individual';
    id: string;
    name: string;
    vehicleId?: string;
    operatorId?: string;
    vcode?: string;
  };
  method: 'subscription_priority' | 'fcfs' | 'dynamic_escalation';
  responseTime: number;
  price?: number;
  escalationLevel?: number;
  error?: string;
}

export interface FleetAssignment {
  fleetId: string;
  vehicleId: string;
  operatorId: string;
  vcode: string;
  distance: number;
  estimatedArrival: number;
  reliabilityScore: number;
  subscriptionActive: boolean;
}

export interface IndividualAssignment {
  operatorId: string;
  vehicleId: string;
  distance: number;
  estimatedArrival: number;
  rating: number;
  onTimeRate: number;
  specializations: string[];
}

export class AssignmentService {
  private static instance: AssignmentService;
  private readonly RESPONSE_TIMEOUT = 2 * 60 * 1000; // 2 minutes in milliseconds
  private readonly ESCALATION_LEVELS = [1.1, 1.2, 1.3]; // 10%, 20%, 30% increases

  public static getInstance(): AssignmentService {
    if (!AssignmentService.instance) {
      AssignmentService.instance = new AssignmentService();
    }
    return AssignmentService.instance;
  }

  // Main assignment logic
  async assignShipment(request: AssignmentRequest): Promise<AssignmentResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Try subscription priority assignment
      const subscriptionResult = await this.trySubscriptionAssignment(request);
      if (subscriptionResult.success) {
        return {
          ...subscriptionResult,
          responseTime: Date.now() - startTime,
          method: 'subscription_priority'
        };
      }

      // Step 2: Try FCFS assignment
      const fcfsResult = await this.tryFCFSAssignment(request);
      if (fcfsResult.success) {
        return {
          ...fcfsResult,
          responseTime: Date.now() - startTime,
          method: 'fcfs'
        };
      }

      // Step 3: Dynamic pricing escalation
      const escalationResult = await this.tryDynamicEscalation(request, startTime);
      return {
        ...escalationResult,
        responseTime: Date.now() - startTime,
        method: 'dynamic_escalation'
      };

    } catch (error) {
      console.error('Assignment failed:', error);
      return {
        success: false,
        responseTime: Date.now() - startTime,
        method: 'fcfs',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Subscription Priority Assignment
  private async trySubscriptionAssignment(request: AssignmentRequest): Promise<AssignmentResult> {
    try {
      // Get active subscribed fleets
      const subscribedFleets = await this.getSubscribedFleets();
      
      if (subscribedFleets.length === 0) {
        return { success: false };
      }

      // Find best matching fleet
      const bestFleet = await this.findBestFleetMatch(request, subscribedFleets);
      if (!bestFleet) {
        return { success: false };
      }

      // Send assignment request to fleet owner
      const assignmentAccepted = await this.sendFleetAssignmentRequest(
        bestFleet.fleetId,
        bestFleet.vehicleId,
        request
      );

      if (assignmentAccepted) {
        // Assign to specific vehicle in fleet
        await this.assignToVehicle(bestFleet.vehicleId, bestFleet.operatorId, request.shipmentId);
        
        return {
          success: true,
          assignedTo: {
            type: 'fleet',
            id: bestFleet.fleetId,
            name: bestFleet.fleetName,
            vehicleId: bestFleet.vehicleId,
            operatorId: bestFleet.operatorId,
            vcode: bestFleet.vcode
          }
        };
      }

      return { success: false };
    } catch (error) {
      console.error('Subscription assignment failed:', error);
      return { success: false };
    }
  }

  // FCFS Assignment
  private async tryFCFSAssignment(request: AssignmentRequest): Promise<AssignmentResult> {
    try {
      // Get all available operators (both fleet and individual)
      const availableOperators = await this.getAvailableOperators(request);
      
      if (availableOperators.length === 0) {
        return { success: false };
      }

      // Sort by response time (first come, first served)
      const sortedOperators = availableOperators.sort((a, b) => 
        a.lastResponseTime - b.lastResponseTime
      );

      // Try assignment with each operator until one accepts
      for (const operator of sortedOperators) {
        const accepted = await this.sendIndividualAssignmentRequest(operator.id, request);
        
        if (accepted) {
          await this.assignToOperator(operator.id, request.shipmentId);
          
          return {
            success: true,
            assignedTo: {
              type: operator.type,
              id: operator.id,
              name: operator.name,
              vehicleId: operator.vehicleId,
              operatorId: operator.id
            }
          };
        }
      }

      return { success: false };
    } catch (error) {
      console.error('FCFS assignment failed:', error);
      return { success: false };
    }
  }

  // Dynamic Pricing Escalation
  private async tryDynamicEscalation(
    request: AssignmentRequest, 
    startTime: number
  ): Promise<AssignmentResult> {
    let currentPrice = request.price;
    
    for (let level = 0; level < this.ESCALATION_LEVELS.length; level++) {
      // Check if we've exceeded timeout
      if (Date.now() - startTime > this.RESPONSE_TIMEOUT) {
        return {
          success: false,
          error: 'Assignment timeout exceeded'
        };
      }

      // Escalate price
      currentPrice = Math.round(request.price * this.ESCALATION_LEVELS[level]);
      
      // Update shipment price
      await this.updateShipmentPrice(request.shipmentId, currentPrice);
      
      // Notify shipper about price escalation
      await this.notifyPriceEscalation(request.shipperId, request.shipmentId, currentPrice, level + 1);
      
      // Try assignment again with new price
      const escalatedRequest = { ...request, price: currentPrice };
      
      // Try subscription assignment first
      const subscriptionResult = await this.trySubscriptionAssignment(escalatedRequest);
      if (subscriptionResult.success) {
        return {
          ...subscriptionResult,
          price: currentPrice,
          escalationLevel: level + 1
        };
      }

      // Try FCFS assignment
      const fcfsResult = await this.tryFCFSAssignment(escalatedRequest);
      if (fcfsResult.success) {
        return {
          ...fcfsResult,
          price: currentPrice,
          escalationLevel: level + 1
        };
      }

      // Wait a bit before next escalation
      await this.delay(30000); // 30 seconds
    }

    // If all escalations failed, cancel shipment
    await this.cancelShipment(request.shipmentId, 'No operators available after price escalation');
    
    return {
      success: false,
      error: 'Shipment cancelled - no operators available after price escalation',
      escalationLevel: 3
    };
  }

  // Helper Methods
  private async getSubscribedFleets(): Promise<any[]> {
    const { data } = await supabase
      .from('fleet_subscriptions')
      .select(`
        *,
        fleets (
          id,
          name,
          vehicles (
            id,
            vcode,
            type,
            status,
            availability,
            operators (
              id,
              name,
              status,
              current_location
            )
          )
        )
      `)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString());

    return data || [];
  }

  private async findBestFleetMatch(request: AssignmentRequest, fleets: any[]): Promise<any> {
    let bestMatch = null;
    let bestScore = 0;

    for (const fleet of fleets) {
      for (const vehicle of fleet.fleets.vehicles) {
        if (vehicle.status === 'active' && vehicle.availability === 'available') {
          const score = this.calculateFleetMatchScore(request, vehicle, fleet);
          
          if (score > bestScore) {
            bestScore = score;
            bestMatch = {
              fleetId: fleet.fleet_id,
              fleetName: fleet.fleets.name,
              vehicleId: vehicle.id,
              operatorId: vehicle.operators[0]?.id,
              vcode: vehicle.vcode,
              score
            };
          }
        }
      }
    }

    return bestMatch;
  }

  private calculateFleetMatchScore(request: AssignmentRequest, vehicle: any, fleet: any): number {
    let score = 0;

    // Vehicle type match
    if (vehicle.type === request.vehicleType) score += 30;

    // Capacity check
    if (vehicle.weight_capacity >= request.weight) score += 20;

    // Distance factor (closer is better)
    const distance = this.calculateDistance(
      request.pickupLocation,
      vehicle.operators[0]?.current_location
    );
    score += Math.max(0, 30 - distance / 10); // Decrease score with distance

    // Fleet reliability
    score += fleet.reliability_score || 0;

    // Subscription priority bonus
    score += 20;

    return score;
  }

  private async getAvailableOperators(request: AssignmentRequest): Promise<any[]> {
    const { data } = await supabase
      .from('operators')
      .select(`
        *,
        vehicles (
          id,
          type,
          weight_capacity,
          availability
        )
      `)
      .eq('status', 'available')
      .eq('vehicles.availability', 'available');

    return data?.filter(op => 
      op.vehicles.some((v: any) => 
        v.type === request.vehicleType && 
        v.weight_capacity >= request.weight
      )
    ) || [];
  }

  private async sendFleetAssignmentRequest(
    fleetId: string, 
    vehicleId: string, 
    request: AssignmentRequest
  ): Promise<boolean> {
    // Send real-time notification to fleet owner
    const notification = {
      type: 'shipment_assignment',
      fleetId,
      vehicleId,
      shipmentId: request.shipmentId,
      pickupLocation: request.pickupLocation,
      destinationLocation: request.destinationLocation,
      price: request.price,
      urgency: request.urgency,
      expiresAt: Date.now() + this.RESPONSE_TIMEOUT
    };

    // Send via real-time channel
    await supabase
      .channel('fleet-assignments')
      .send({
        type: 'broadcast',
        event: 'assignment_request',
        payload: notification
      });

    // Wait for response (in real implementation, this would be handled by real-time events)
    return await this.waitForFleetResponse(fleetId, request.shipmentId);
  }

  private async sendIndividualAssignmentRequest(
    operatorId: string, 
    request: AssignmentRequest
  ): Promise<boolean> {
    // Send real-time notification to individual operator
    const notification = {
      type: 'shipment_assignment',
      operatorId,
      shipmentId: request.shipmentId,
      pickupLocation: request.pickupLocation,
      destinationLocation: request.destinationLocation,
      price: request.price,
      urgency: request.urgency,
      expiresAt: Date.now() + this.RESPONSE_TIMEOUT
    };

    // Send via real-time channel
    await supabase
      .channel('operator-assignments')
      .send({
        type: 'broadcast',
        event: 'assignment_request',
        payload: notification
      });

    // Wait for response
    return await this.waitForOperatorResponse(operatorId, request.shipmentId);
  }

  private async waitForFleetResponse(fleetId: string, shipmentId: string): Promise<boolean> {
    // In real implementation, this would listen to real-time events
    // For now, simulate with timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock: 70% acceptance rate for subscribed fleets
        resolve(Math.random() > 0.3);
      }, 5000);
    });
  }

  private async waitForOperatorResponse(operatorId: string, shipmentId: string): Promise<boolean> {
    // In real implementation, this would listen to real-time events
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock: 50% acceptance rate for individual operators
        resolve(Math.random() > 0.5);
      }, 3000);
    });
  }

  private async assignToVehicle(vehicleId: string, operatorId: string, shipmentId: string): Promise<void> {
    await supabase
      .from('shipments')
      .update({
        vehicle_id: vehicleId,
        operator_id: operatorId,
        status: 'assigned'
      })
      .eq('id', shipmentId);
  }

  private async assignToOperator(operatorId: string, shipmentId: string): Promise<void> {
    await supabase
      .from('shipments')
      .update({
        operator_id: operatorId,
        status: 'assigned'
      })
      .eq('id', shipmentId);
  }

  private async updateShipmentPrice(shipmentId: string, newPrice: number): Promise<void> {
    await supabase
      .from('shipments')
      .update({ price: newPrice })
      .eq('id', shipmentId);
  }

  private async notifyPriceEscalation(
    shipperId: string, 
    shipmentId: string, 
    newPrice: number, 
    level: number
  ): Promise<void> {
    // Send notification to shipper about price escalation
    await supabase
      .from('notifications')
      .insert({
        user_id: shipperId,
        user_type: 'shipper',
        type: 'warning',
        title: 'Shipment Price Escalated',
        message: `Your shipment ${shipmentId} price has been increased to ₹${newPrice} (Level ${level} escalation)`,
        data: { shipmentId, newPrice, level }
      });
  }

  private async cancelShipment(shipmentId: string, reason: string): Promise<void> {
    await supabase
      .from('shipments')
      .update({
        status: 'cancelled',
        special_handling: reason
      })
      .eq('id', shipmentId);
  }

  private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    if (!point2) return Infinity;
    
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const assignmentService = AssignmentService.getInstance();
