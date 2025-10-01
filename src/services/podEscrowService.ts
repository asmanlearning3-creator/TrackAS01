import { supabase } from '../lib/supabase';

interface PODUploadData {
  shipmentId: string;
  photoUrls: string[];
  signatureImageUrl: string;
  recipientName: string;
  recipientRelationship?: string;
  deliveryNotes?: string;
  locationLat: number;
  locationLng: number;
  locationAddress: string;
  uploadedBy: string;
}

interface EscrowReleaseResult {
  success: boolean;
  escrowId?: string;
  amountReleased?: number;
  recipientType?: 'fleet' | 'individual' | 'driver';
  recipientId?: string;
  error?: string;
}

export class PODEscrowService {
  async uploadPOD(podData: PODUploadData): Promise<{ success: boolean; podId?: string; error?: string }> {
    const { data: shipment } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', podData.shipmentId)
      .single();

    if (!shipment) {
      return { success: false, error: 'Shipment not found' };
    }

    if (shipment.status !== 'in_transit') {
      return { success: false, error: 'Shipment must be in transit to upload POD' };
    }

    const { data: pod, error: podError } = await supabase
      .from('proof_of_delivery')
      .insert({
        shipment_id: podData.shipmentId,
        photo_urls: podData.photoUrls,
        signature_image_url: podData.signatureImageUrl,
        recipient_name: podData.recipientName,
        recipient_relationship: podData.recipientRelationship,
        delivery_notes: podData.deliveryNotes,
        location_lat: podData.locationLat,
        location_lng: podData.locationLng,
        location_address: podData.locationAddress,
        uploaded_by: podData.uploadedBy,
        verified: false
      })
      .select('id')
      .single();

    if (podError || !pod) {
      return { success: false, error: 'Failed to upload POD' };
    }

    const verificationResult = await this.verifyPOD(
      pod.id,
      podData.locationLat,
      podData.locationLng,
      shipment.destination_location_lat,
      shipment.destination_location_lng
    );

    if (verificationResult.verified) {
      await this.completeDelivery(podData.shipmentId);

      const escrowResult = await this.releaseEscrow(podData.shipmentId);

      if (!escrowResult.success) {
        console.error('Escrow release failed:', escrowResult.error);
      }
    }

    return { success: true, podId: pod.id };
  }

  private async verifyPOD(
    podId: string,
    uploadLat: number,
    uploadLng: number,
    destinationLat: number,
    destinationLng: number
  ): Promise<{ verified: boolean; reason?: string }> {
    const distance = this.calculateDistance(
      { lat: uploadLat, lng: uploadLng },
      { lat: destinationLat, lng: destinationLng }
    );

    const MAX_ALLOWED_DISTANCE_KM = 0.5;

    if (distance > MAX_ALLOWED_DISTANCE_KM) {
      return {
        verified: false,
        reason: `POD location is ${distance.toFixed(2)}km from destination (max allowed: ${MAX_ALLOWED_DISTANCE_KM}km)`
      };
    }

    await supabase
      .from('proof_of_delivery')
      .update({ verified: true })
      .eq('id', podId);

    return { verified: true };
  }

  private async completeDelivery(shipmentId: string): Promise<void> {
    const now = new Date().toISOString();

    await supabase
      .from('shipments')
      .update({
        status: 'delivered',
        delivered_at: now,
        actual_delivery_time: now
      })
      .eq('id', shipmentId);

    const { data: shipment } = await supabase
      .from('shipments')
      .select('assigned_vehicle_id, assigned_operator_type, assigned_individual_operator_id')
      .eq('id', shipmentId)
      .single();

    if (shipment?.assigned_vehicle_id) {
      await supabase
        .from('vehicles')
        .update({ availability_status: 'available' })
        .eq('id', shipment.assigned_vehicle_id);
    }

    if (shipment?.assigned_operator_type === 'individual' && shipment.assigned_individual_operator_id) {
      await supabase
        .from('individual_operators')
        .update({ availability_status: 'available' })
        .eq('id', shipment.assigned_individual_operator_id);

      await supabase.rpc('increment', {
        table_name: 'individual_operators',
        id_value: shipment.assigned_individual_operator_id,
        column_name: 'total_deliveries'
      });
    }
  }

  async releaseEscrow(shipmentId: string): Promise<EscrowReleaseResult> {
    const { data: escrow } = await supabase
      .from('escrow_transactions')
      .select('*')
      .eq('shipment_id', shipmentId)
      .eq('status', 'held')
      .single();

    if (!escrow) {
      return { success: false, error: 'No held escrow found for this shipment' };
    }

    const { data: shipment } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single();

    if (!shipment) {
      return { success: false, error: 'Shipment not found' };
    }

    if (shipment.status !== 'delivered') {
      return { success: false, error: 'Shipment must be delivered to release escrow' };
    }

    let recipientType: 'fleet' | 'individual' | 'driver';
    let recipientId: string;

    if (shipment.assigned_operator_type === 'fleet') {
      recipientType = 'fleet';
      recipientId = shipment.assigned_fleet_operator_id;
    } else {
      recipientType = 'individual';
      recipientId = shipment.assigned_individual_operator_id;
    }

    const { error: releaseError } = await supabase
      .from('escrow_transactions')
      .update({
        status: 'released',
        release_date: new Date().toISOString(),
        recipient_type: recipientType,
        recipient_id: recipientId
      })
      .eq('id', escrow.id);

    if (releaseError) {
      return { success: false, error: 'Failed to release escrow' };
    }

    await supabase
      .from('shipments')
      .update({ payment_settled: true })
      .eq('id', shipmentId);

    if (recipientType === 'fleet') {
      await this.creditFleetOperator(recipientId, escrow.amount_shipment);
    } else if (recipientType === 'individual') {
      await this.creditIndividualOperator(recipientId, escrow.amount_shipment);
    }

    return {
      success: true,
      escrowId: escrow.id,
      amountReleased: escrow.amount_shipment,
      recipientType,
      recipientId
    };
  }

  private async creditFleetOperator(operatorId: string, amount: number): Promise<void> {
    const { data: operator } = await supabase
      .from('fleet_operators')
      .select('company_name')
      .eq('id', operatorId)
      .single();

    if (operator) {
      console.log(`Credited ${amount} INR to fleet operator: ${operator.company_name}`);
    }
  }

  private async creditIndividualOperator(operatorId: string, amount: number): Promise<void> {
    await supabase
      .from('individual_operators')
      .update({
        total_earnings: supabase.rpc('increment_earnings', { operator_id: operatorId, amount })
      })
      .eq('id', operatorId);

    console.log(`Credited ${amount} INR to individual operator: ${operatorId}`);
  }

  async refundEscrow(
    shipmentId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    const { data: escrow } = await supabase
      .from('escrow_transactions')
      .select('*')
      .eq('shipment_id', shipmentId)
      .eq('status', 'held')
      .single();

    if (!escrow) {
      return { success: false, error: 'No held escrow found for this shipment' };
    }

    const { error: refundError } = await supabase
      .from('escrow_transactions')
      .update({
        status: 'refunded',
        refund_reason: reason
      })
      .eq('id', escrow.id);

    if (refundError) {
      return { success: false, error: 'Failed to refund escrow' };
    }

    await supabase
      .from('commission_transactions')
      .update({ status: 'refunded' })
      .eq('shipment_id', shipmentId)
      .eq('status', 'collected');

    console.log(`Refunded ${escrow.amount_total} INR for shipment ${shipmentId}`);

    return { success: true };
  }

  private calculateDistance(
    loc1: { lat: number; lng: number },
    loc2: { lat: number; lng: number }
  ): number {
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

export const podEscrowService = new PODEscrowService();
