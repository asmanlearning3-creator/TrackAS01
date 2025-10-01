import { supabase } from '../lib/supabase';
import { assignmentEngine } from './assignmentEngine';

interface Location {
  lat: number;
  lng: number;
}

interface ShipmentDetails {
  id: string;
  pickupLocation: Location;
  vehicleTypeRequired: string;
  urgency: 'standard' | 'urgent' | 'express';
  basePrice: number;
  currentPrice: number;
  priceEscalationCount: number;
}

export class AssignmentOrchestrator {
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();

  async initiateAssignment(shipmentId: string): Promise<boolean> {
    const { data: shipment } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single();

    if (!shipment) {
      console.error('Shipment not found:', shipmentId);
      return false;
    }

    const shipmentDetails: ShipmentDetails = {
      id: shipment.id,
      pickupLocation: {
        lat: shipment.pickup_location_lat,
        lng: shipment.pickup_location_lng
      },
      vehicleTypeRequired: shipment.vehicle_type_required,
      urgency: shipment.urgency,
      basePrice: shipment.base_price,
      currentPrice: shipment.current_price,
      priceEscalationCount: shipment.price_escalation_count
    };

    return this.runAssignmentCycle(shipmentDetails, 1);
  }

  private async runAssignmentCycle(
    shipment: ShipmentDetails,
    cycle: number
  ): Promise<boolean> {
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'max_assignment_retries')
      .single();

    const maxRetries = settings ? parseInt(settings.setting_value as string) : 3;

    if (cycle > maxRetries) {
      await this.handleAssignmentFailure(shipment.id);
      return false;
    }

    const candidates = await assignmentEngine.findBestCandidates(
      shipment.id,
      shipment.pickupLocation,
      shipment.vehicleTypeRequired,
      shipment.urgency,
      5
    );

    if (candidates.length === 0) {
      if (cycle < maxRetries) {
        await this.escalatePrice(shipment.id, cycle);
        setTimeout(() => {
          this.runAssignmentCycle(
            { ...shipment, priceEscalationCount: cycle },
            cycle + 1
          );
        }, 5000);
      } else {
        await this.handleAssignmentFailure(shipment.id);
      }
      return false;
    }

    for (const candidate of candidates) {
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('operator_type')
        .eq('id', candidate.vehicleId)
        .single();

      if (!vehicle) continue;

      const assignmentId = await assignmentEngine.createAssignment(
        shipment.id,
        candidate.vehicleId,
        vehicle.operator_type as 'fleet' | 'individual',
        cycle,
        candidate.score
      );

      if (assignmentId) {
        this.startAssignmentTimer(assignmentId, shipment, cycle);
        return true;
      }
    }

    return false;
  }

  private startAssignmentTimer(
    assignmentId: string,
    shipment: ShipmentDetails,
    cycle: number
  ): void {
    const { data: settings } = supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'assignment_timeout_seconds')
      .single()
      .then(({ data }) => {
        const timeoutSeconds = data ? parseInt(data.setting_value as string) : 120;

        const timer = setTimeout(async () => {
          await this.handleTimeout(assignmentId, shipment, cycle);
        }, timeoutSeconds * 1000);

        this.activeTimers.set(assignmentId, timer);
      });
  }

  private async handleTimeout(
    assignmentId: string,
    shipment: ShipmentDetails,
    cycle: number
  ): Promise<void> {
    await assignmentEngine.handleAssignmentTimeout(assignmentId);

    this.activeTimers.delete(assignmentId);

    const { data: assignment } = await supabase
      .from('shipment_assignments')
      .select('response_status')
      .eq('id', assignmentId)
      .single();

    if (assignment?.response_status === 'timeout') {
      await this.runAssignmentCycle(shipment, cycle + 1);
    }
  }

  async acceptAssignment(assignmentId: string): Promise<boolean> {
    const success = await assignmentEngine.processAssignmentResponse(assignmentId, true);

    if (success) {
      const timer = this.activeTimers.get(assignmentId);
      if (timer) {
        clearTimeout(timer);
        this.activeTimers.delete(assignmentId);
      }
    }

    return success;
  }

  async rejectAssignment(assignmentId: string, reason: string): Promise<boolean> {
    const success = await assignmentEngine.processAssignmentResponse(
      assignmentId,
      false,
      reason
    );

    const timer = this.activeTimers.get(assignmentId);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(assignmentId);
    }

    const { data: assignment } = await supabase
      .from('shipment_assignments')
      .select('shipment_id, assignment_cycle, shipments(*)')
      .eq('id', assignmentId)
      .single();

    if (assignment) {
      const shipmentDetails: ShipmentDetails = {
        id: assignment.shipment_id,
        pickupLocation: {
          lat: assignment.shipments.pickup_location_lat,
          lng: assignment.shipments.pickup_location_lng
        },
        vehicleTypeRequired: assignment.shipments.vehicle_type_required,
        urgency: assignment.shipments.urgency,
        basePrice: assignment.shipments.base_price,
        currentPrice: assignment.shipments.current_price,
        priceEscalationCount: assignment.shipments.price_escalation_count
      };

      setTimeout(() => {
        this.runAssignmentCycle(shipmentDetails, assignment.assignment_cycle);
      }, 1000);
    }

    return success;
  }

  private async escalatePrice(shipmentId: string, cycle: number): Promise<void> {
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'dynamic_pricing_escalation')
      .single();

    if (!settings) return;

    const escalationConfig = settings.setting_value as any;
    let escalationPercent = 0;

    switch (cycle) {
      case 1:
        escalationPercent = escalationConfig.first_retry || 10;
        break;
      case 2:
        escalationPercent = escalationConfig.second_retry || 20;
        break;
      case 3:
        escalationPercent = escalationConfig.third_retry || 0;
        break;
    }

    if (escalationPercent === 0) return;

    const { data: shipment } = await supabase
      .from('shipments')
      .select('base_price, current_price')
      .eq('id', shipmentId)
      .single();

    if (!shipment) return;

    const newPrice = shipment.current_price * (1 + escalationPercent / 100);
    const commissionPercent = await this.getCommissionPercentage();
    const newCommission = newPrice * (commissionPercent / 100);
    const newTotal = newPrice + newCommission;

    await supabase
      .from('shipments')
      .update({
        current_price: newPrice,
        commission_amount: newCommission,
        total_cost: newTotal,
        price_escalation_count: cycle
      })
      .eq('id', shipmentId);

    await supabase
      .from('escrow_transactions')
      .update({
        amount_total: newTotal,
        amount_shipment: newPrice,
        amount_commission: newCommission
      })
      .eq('shipment_id', shipmentId)
      .eq('status', 'held');
  }

  private async handleAssignmentFailure(shipmentId: string): Promise<void> {
    await supabase
      .from('shipments')
      .update({ status: 'failed' })
      .eq('id', shipmentId);

    await supabase
      .from('escrow_transactions')
      .update({
        status: 'refunded',
        refund_reason: 'No available operators could be assigned'
      })
      .eq('shipment_id', shipmentId)
      .eq('status', 'held');
  }

  private async getCommissionPercentage(): Promise<number> {
    const { data } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'commission_percentage')
      .single();

    return data ? parseFloat(data.setting_value as string) : 5;
  }
}

export const assignmentOrchestrator = new AssignmentOrchestrator();
