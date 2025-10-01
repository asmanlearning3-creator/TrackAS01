import { supabase } from '../lib/supabase';

interface Location {
  lat: number;
  lng: number;
}

interface VehicleCandidate {
  id: string;
  operatorType: 'fleet' | 'individual';
  fleetOperatorId?: string;
  individualOperatorId?: string;
  vehicleType: string;
  currentLocation: Location;
  availabilityStatus: string;
  reliabilityScore: number;
  hasActiveSubscription: boolean;
  subscriptionTier?: number;
  activeShipments: number;
}

interface AssignmentScore {
  vehicleId: string;
  score: number;
  breakdown: {
    compatibility: number;
    distance: number;
    reliability: number;
    workload: number;
    subscriptionBonus: number;
  };
}

const MAX_DISTANCE_KM = 50;
const ASSIGNMENT_TIMEOUT_SECONDS = 120;

export class AssignmentEngine {
  async findBestCandidates(
    shipmentId: string,
    pickupLocation: Location,
    vehicleTypeRequired: string,
    urgency: 'standard' | 'urgent' | 'express',
    limit: number = 10
  ): Promise<AssignmentScore[]> {
    const candidates = await this.getAvailableVehicles(vehicleTypeRequired, pickupLocation);

    if (candidates.length === 0) {
      return [];
    }

    const scoredCandidates = candidates.map(candidate =>
      this.calculateScore(candidate, pickupLocation, urgency)
    );

    scoredCandidates.sort((a, b) => b.score - a.score);

    return scoredCandidates.slice(0, limit);
  }

  private async getAvailableVehicles(
    vehicleType: string,
    pickupLocation: Location
  ): Promise<VehicleCandidate[]> {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select(`
        id,
        operator_type,
        fleet_operator_id,
        individual_operator_id,
        vehicle_type,
        current_location_lat,
        current_location_lng,
        availability_status,
        fleet_operators!fleet_operator_id (
          reliability_score,
          subscription_model,
          status
        ),
        individual_operators!individual_operator_id (
          reliability_score,
          availability_status,
          status
        )
      `)
      .eq('status', 'active')
      .eq('availability_status', 'available')
      .or(`vehicle_type.eq.${vehicleType},vehicle_type.eq.truck`);

    if (error || !vehicles) {
      console.error('Error fetching vehicles:', error);
      return [];
    }

    const candidates: VehicleCandidate[] = [];

    for (const vehicle of vehicles) {
      if (!vehicle.current_location_lat || !vehicle.current_location_lng) {
        continue;
      }

      const distance = this.calculateDistance(
        pickupLocation,
        { lat: vehicle.current_location_lat, lng: vehicle.current_location_lng }
      );

      if (distance > MAX_DISTANCE_KM) {
        continue;
      }

      let reliabilityScore = 100;
      let hasActiveSubscription = false;
      let subscriptionTier = 0;
      let operatorStatus = 'pending';

      if (vehicle.operator_type === 'fleet' && vehicle.fleet_operators) {
        reliabilityScore = vehicle.fleet_operators.reliability_score || 100;
        hasActiveSubscription = vehicle.fleet_operators.subscription_model === 'subscription';
        operatorStatus = vehicle.fleet_operators.status;

        if (hasActiveSubscription) {
          const { data: subscription } = await supabase
            .from('fleet_subscriptions')
            .select('subscription_plan_id, subscription_plans(vehicle_range_max)')
            .eq('fleet_operator_id', vehicle.fleet_operator_id)
            .eq('status', 'active')
            .single();

          if (subscription?.subscription_plans) {
            const maxVehicles = subscription.subscription_plans.vehicle_range_max || 5;
            subscriptionTier = maxVehicles > 20 ? 3 : maxVehicles > 5 ? 2 : 1;
          }
        }
      } else if (vehicle.operator_type === 'individual' && vehicle.individual_operators) {
        reliabilityScore = vehicle.individual_operators.reliability_score || 100;
        operatorStatus = vehicle.individual_operators.status;
      }

      if (operatorStatus !== 'approved') {
        continue;
      }

      const { data: activeShipments } = await supabase
        .from('shipments')
        .select('id', { count: 'exact' })
        .eq('assigned_vehicle_id', vehicle.id)
        .in('status', ['assigned', 'pickup_confirmed', 'in_transit']);

      candidates.push({
        id: vehicle.id,
        operatorType: vehicle.operator_type,
        fleetOperatorId: vehicle.fleet_operator_id,
        individualOperatorId: vehicle.individual_operator_id,
        vehicleType: vehicle.vehicle_type,
        currentLocation: {
          lat: vehicle.current_location_lat,
          lng: vehicle.current_location_lng
        },
        availabilityStatus: vehicle.availability_status,
        reliabilityScore,
        hasActiveSubscription,
        subscriptionTier,
        activeShipments: activeShipments?.length || 0
      });
    }

    return candidates;
  }

  private calculateScore(
    candidate: VehicleCandidate,
    pickupLocation: Location,
    urgency: 'standard' | 'urgent' | 'express'
  ): AssignmentScore {
    const distance = this.calculateDistance(pickupLocation, candidate.currentLocation);

    const compatibilityScore = 1.0;

    const distanceScore = 1 - (distance / MAX_DISTANCE_KM);

    const reliabilityNormalized = candidate.reliabilityScore / 100;

    const workloadNormalized = Math.min(candidate.activeShipments / 5, 1);

    let subscriptionBonus = 0;
    if (candidate.hasActiveSubscription) {
      subscriptionBonus = 0.15 * candidate.subscriptionTier;
    }

    const score =
      0.4 * compatibilityScore +
      0.25 * distanceScore +
      0.2 * reliabilityNormalized +
      0.1 * (1 - workloadNormalized) +
      subscriptionBonus;

    return {
      vehicleId: candidate.id,
      score,
      breakdown: {
        compatibility: compatibilityScore,
        distance: distanceScore,
        reliability: reliabilityNormalized,
        workload: workloadNormalized,
        subscriptionBonus
      }
    };
  }

  async createAssignment(
    shipmentId: string,
    vehicleId: string,
    operatorType: 'fleet' | 'individual',
    assignmentCycle: number,
    priorityScore: number
  ): Promise<string | null> {
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('fleet_operator_id, individual_operator_id')
      .eq('id', vehicleId)
      .single();

    if (!vehicle) {
      return null;
    }

    const responseDeadline = new Date(Date.now() + ASSIGNMENT_TIMEOUT_SECONDS * 1000);

    const { data: assignment, error } = await supabase
      .from('shipment_assignments')
      .insert({
        shipment_id: shipmentId,
        assignment_cycle: assignmentCycle,
        operator_type: operatorType,
        target_fleet_operator_id: vehicle.fleet_operator_id,
        target_individual_operator_id: vehicle.individual_operator_id,
        target_vehicle_id: vehicleId,
        response_deadline: responseDeadline.toISOString(),
        priority_score: priorityScore
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating assignment:', error);
      return null;
    }

    await supabase
      .from('shipments')
      .update({ status: 'assigning' })
      .eq('id', shipmentId);

    return assignment.id;
  }

  async processAssignmentResponse(
    assignmentId: string,
    accepted: boolean,
    rejectionReason?: string
  ): Promise<boolean> {
    const { data: assignment } = await supabase
      .from('shipment_assignments')
      .select('*, shipments(*)')
      .eq('id', assignmentId)
      .single();

    if (!assignment || assignment.response_status !== 'pending') {
      return false;
    }

    const now = new Date();
    const responseStatus = accepted ? 'accepted' : 'rejected';

    await supabase
      .from('shipment_assignments')
      .update({
        response_status: responseStatus,
        response_received_at: now.toISOString(),
        rejection_reason: rejectionReason
      })
      .eq('id', assignmentId);

    if (accepted) {
      await supabase
        .from('shipments')
        .update({
          status: 'assigned',
          assigned_operator_type: assignment.operator_type,
          assigned_fleet_operator_id: assignment.target_fleet_operator_id,
          assigned_individual_operator_id: assignment.target_individual_operator_id,
          assigned_vehicle_id: assignment.target_vehicle_id,
          assignment_accepted_at: now.toISOString()
        })
        .eq('id', assignment.shipment_id);

      await supabase
        .from('vehicles')
        .update({ availability_status: 'busy' })
        .eq('id', assignment.target_vehicle_id);

      if (assignment.operator_type === 'individual') {
        await supabase
          .from('individual_operators')
          .update({ availability_status: 'on_trip' })
          .eq('id', assignment.target_individual_operator_id);
      }

      return true;
    }

    return false;
  }

  async handleAssignmentTimeout(assignmentId: string): Promise<void> {
    const { data: assignment } = await supabase
      .from('shipment_assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (!assignment || assignment.response_status !== 'pending') {
      return;
    }

    const now = new Date();
    const deadline = new Date(assignment.response_deadline);

    if (now < deadline) {
      return;
    }

    await supabase
      .from('shipment_assignments')
      .update({
        response_status: 'timeout',
        response_received_at: now.toISOString()
      })
      .eq('id', assignmentId);
  }

  private calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371;
    const dLat = this.deg2rad(loc2.lat - loc1.lat);
    const dLon = this.deg2rad(loc2.lng - loc1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(loc1.lat)) *
        Math.cos(this.deg2rad(loc2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const assignmentEngine = new AssignmentEngine();
