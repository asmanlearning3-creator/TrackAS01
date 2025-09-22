import { supabase } from '../lib/supabase';

export interface EscrowTransaction {
  id: string;
  shipmentId: string;
  shipperId: string;
  operatorId?: string;
  fleetId?: string;
  amount: number;
  commission: number;
  platformFee: number;
  operatorShare: number;
  status: 'pending' | 'held' | 'released' | 'refunded' | 'disputed';
  createdAt: string;
  releasedAt?: string;
  refundedAt?: string;
  disputeReason?: string;
}

export interface CommissionConfig {
  id: string;
  percentage: number; // 0-10%
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  createdBy: string;
}

export interface FleetSubscription {
  id: string;
  fleetId: string;
  plan: 'basic' | 'premium' | 'enterprise';
  monthlyFee: number;
  vehicleSlab: {
    min: number;
    max: number;
    feePerVehicle: number;
  };
  status: 'active' | 'expired' | 'suspended' | 'cancelled';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  totalVehicles: number;
  totalFee: number;
}

export class EscrowService {
  private static instance: EscrowService;
  
  public static getInstance(): EscrowService {
    if (!EscrowService.instance) {
      EscrowService.instance = new EscrowService();
    }
    return EscrowService.instance;
  }

  // Commission Management
  async getCommissionConfig(): Promise<CommissionConfig | null> {
    try {
      const { data, error } = await supabase
        .from('commission_config')
        .select('*')
        .eq('is_active', true)
        .order('effective_from', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching commission config:', error);
      return null;
    }
  }

  async updateCommissionConfig(percentage: number, adminId: string): Promise<boolean> {
    try {
      // Deactivate current config
      await supabase
        .from('commission_config')
        .update({ is_active: false, effective_to: new Date().toISOString() })
        .eq('is_active', true);

      // Create new config
      const { error } = await supabase
        .from('commission_config')
        .insert({
          percentage: Math.min(Math.max(percentage, 0), 10), // Ensure 0-10%
          is_active: true,
          effective_from: new Date().toISOString(),
          created_by: adminId
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating commission config:', error);
      return false;
    }
  }

  // Escrow Operations
  async createEscrowTransaction(
    shipmentId: string,
    shipperId: string,
    amount: number,
    commissionPercentage: number
  ): Promise<EscrowTransaction | null> {
    try {
      const commission = (amount * commissionPercentage) / 100;
      const platformFee = commission;
      const operatorShare = amount - platformFee;

      const { data, error } = await supabase
        .from('escrow_transactions')
        .insert({
          shipment_id: shipmentId,
          shipper_id: shipperId,
          amount,
          commission,
          platform_fee: platformFee,
          operator_share: operatorShare,
          status: 'held'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating escrow transaction:', error);
      return null;
    }
  }

  async assignOperatorToEscrow(
    transactionId: string,
    operatorId: string,
    fleetId?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('escrow_transactions')
        .update({
          operator_id: operatorId,
          fleet_id: fleetId,
          status: 'held'
        })
        .eq('id', transactionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error assigning operator to escrow:', error);
      return false;
    }
  }

  async releaseEscrowPayment(transactionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('escrow_transactions')
        .update({
          status: 'released',
          released_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;

      // Create payment record for operator
      const transaction = await this.getEscrowTransaction(transactionId);
      if (transaction) {
        await this.createOperatorPayment(transaction);
      }

      return true;
    } catch (error) {
      console.error('Error releasing escrow payment:', error);
      return false;
    }
  }

  async refundEscrowPayment(transactionId: string, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('escrow_transactions')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString(),
          dispute_reason: reason
        })
        .eq('id', transactionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error refunding escrow payment:', error);
      return false;
    }
  }

  async getEscrowTransaction(transactionId: string): Promise<EscrowTransaction | null> {
    try {
      const { data, error } = await supabase
        .from('escrow_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching escrow transaction:', error);
      return null;
    }
  }

  async getEscrowTransactionsByShipper(shipperId: string): Promise<EscrowTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('escrow_transactions')
        .select('*')
        .eq('shipper_id', shipperId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching shipper escrow transactions:', error);
      return [];
    }
  }

  async getEscrowTransactionsByOperator(operatorId: string): Promise<EscrowTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('escrow_transactions')
        .select('*')
        .eq('operator_id', operatorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching operator escrow transactions:', error);
      return [];
    }
  }

  // Fleet Subscription Management
  async createFleetSubscription(
    fleetId: string,
    plan: 'basic' | 'premium' | 'enterprise',
    vehicleCount: number,
    adminId: string
  ): Promise<FleetSubscription | null> {
    try {
      const planConfig = this.getPlanConfig(plan);
      const monthlyFee = vehicleCount * planConfig.feePerVehicle;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      const nextBillingDate = endDate;

      const { data, error } = await supabase
        .from('fleet_subscriptions')
        .insert({
          fleet_id: fleetId,
          plan,
          monthly_fee: monthlyFee,
          vehicle_slab: planConfig.vehicleSlab,
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          next_billing_date: nextBillingDate.toISOString(),
          total_vehicles: vehicleCount,
          total_fee: monthlyFee
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating fleet subscription:', error);
      return null;
    }
  }

  async updateFleetSubscription(
    subscriptionId: string,
    updates: Partial<FleetSubscription>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('fleet_subscriptions')
        .update(updates)
        .eq('id', subscriptionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating fleet subscription:', error);
      return false;
    }
  }

  async getFleetSubscriptions(fleetId?: string): Promise<FleetSubscription[]> {
    try {
      let query = supabase
        .from('fleet_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (fleetId) {
        query = query.eq('fleet_id', fleetId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching fleet subscriptions:', error);
      return [];
    }
  }

  async processSubscriptionPayment(subscriptionId: string): Promise<boolean> {
    try {
      const subscription = await this.getFleetSubscription(subscriptionId);
      if (!subscription) return false;

      // Process payment (integrate with payment gateway)
      const paymentSuccess = await this.processPaymentGateway(
        subscription.fleet_id,
        subscription.total_fee,
        'subscription'
      );

      if (paymentSuccess) {
        // Update next billing date
        const nextBillingDate = new Date(subscription.next_billing_date);
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

        await this.updateFleetSubscription(subscriptionId, {
          next_billing_date: nextBillingDate.toISOString(),
          status: 'active'
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error processing subscription payment:', error);
      return false;
    }
  }

  // Dynamic Pricing Escalation
  async escalateShipmentPrice(
    shipmentId: string,
    escalationLevel: 1 | 2 | 3
  ): Promise<{ newPrice: number; shouldCancel: boolean }> {
    try {
      const shipment = await this.getShipmentDetails(shipmentId);
      if (!shipment) return { newPrice: 0, shouldCancel: true };

      const escalationMultipliers = { 1: 1.1, 2: 1.2, 3: 1.3 };
      const newPrice = Math.round(shipment.price * escalationMultipliers[escalationLevel]);

      if (escalationLevel === 3) {
        return { newPrice, shouldCancel: true };
      }

      // Update shipment price
      await this.updateShipmentPrice(shipmentId, newPrice);
      return { newPrice, shouldCancel: false };
    } catch (error) {
      console.error('Error escalating shipment price:', error);
      return { newPrice: 0, shouldCancel: true };
    }
  }

  // Analytics
  async getEscrowAnalytics(adminId: string): Promise<any> {
    try {
      const [
        totalHeld,
        totalReleased,
        totalRefunded,
        commissionEarned,
        subscriptionRevenue
      ] = await Promise.all([
        this.getTotalEscrowAmount('held'),
        this.getTotalEscrowAmount('released'),
        this.getTotalEscrowAmount('refunded'),
        this.getTotalCommissionEarned(),
        this.getTotalSubscriptionRevenue()
      ]);

      return {
        totalHeld,
        totalReleased,
        totalRefunded,
        commissionEarned,
        subscriptionRevenue,
        netRevenue: commissionEarned + subscriptionRevenue
      };
    } catch (error) {
      console.error('Error fetching escrow analytics:', error);
      return null;
    }
  }

  // Helper Methods
  private getPlanConfig(plan: string) {
    const configs = {
      basic: { feePerVehicle: 500, vehicleSlab: { min: 1, max: 10 } },
      premium: { feePerVehicle: 800, vehicleSlab: { min: 11, max: 50 } },
      enterprise: { feePerVehicle: 1200, vehicleSlab: { min: 51, max: 999 } }
    };
    return configs[plan as keyof typeof configs] || configs.basic;
  }

  private async createOperatorPayment(transaction: EscrowTransaction): Promise<void> {
    // Implementation for creating operator payment record
    console.log('Creating operator payment:', transaction);
  }

  private async processPaymentGateway(
    recipientId: string,
    amount: number,
    type: string
  ): Promise<boolean> {
    // Integration with payment gateway (Razorpay, Stripe, etc.)
    console.log('Processing payment:', { recipientId, amount, type });
    return true; // Mock implementation
  }

  private async getShipmentDetails(shipmentId: string): Promise<any> {
    const { data } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single();
    return data;
  }

  private async updateShipmentPrice(shipmentId: string, newPrice: number): Promise<void> {
    await supabase
      .from('shipments')
      .update({ price: newPrice })
      .eq('id', shipmentId);
  }

  private async getTotalEscrowAmount(status: string): Promise<number> {
    const { data } = await supabase
      .from('escrow_transactions')
      .select('amount')
      .eq('status', status);
    
    return data?.reduce((sum, t) => sum + t.amount, 0) || 0;
  }

  private async getTotalCommissionEarned(): Promise<number> {
    const { data } = await supabase
      .from('escrow_transactions')
      .select('commission')
      .eq('status', 'released');
    
    return data?.reduce((sum, t) => sum + t.commission, 0) || 0;
  }

  private async getTotalSubscriptionRevenue(): Promise<number> {
    const { data } = await supabase
      .from('fleet_subscriptions')
      .select('total_fee')
      .eq('status', 'active');
    
    return data?.reduce((sum, s) => sum + s.total_fee, 0) || 0;
  }

  private async getFleetSubscription(subscriptionId: string): Promise<FleetSubscription | null> {
    const { data } = await supabase
      .from('fleet_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();
    return data;
  }
}

export const escrowService = EscrowService.getInstance();

