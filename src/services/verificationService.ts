import { supabase } from '../lib/supabase';

export interface VerificationDocument {
  id: string;
  type: 'tin' | 'business_registration' | 'vehicle_rc' | 'insurance' | 'driver_license' | 'bank_account';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  rejectedReason?: string;
  verifiedBy?: string;
}

export interface CompanyVerification {
  id: string;
  companyId: string;
  companyName: string;
  tin: string;
  businessRegistrationNumber: string;
  address: string;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
  };
  documents: VerificationDocument[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  approvalTimeline?: string;
}

export interface VehicleVerification {
  id: string;
  vehicleId: string;
  registrationNumber: string;
  vehicleType: string;
  ownerType: 'fleet' | 'individual';
  ownerId: string;
  documents: VerificationDocument[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  vcode?: string;
}

export interface DriverVerification {
  id: string;
  driverId: string;
  name: string;
  licenseNumber: string;
  phone: string;
  email: string;
  documents: VerificationDocument[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface VerificationWorkflow {
  id: string;
  type: 'company' | 'vehicle' | 'driver';
  entityId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  steps: VerificationStep[];
  currentStep: number;
  startedAt: string;
  completedAt?: string;
  assignedTo?: string;
}

export interface VerificationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  required: boolean;
  completedAt?: string;
  notes?: string;
  documents?: string[];
}

export class VerificationService {
  private static instance: VerificationService;

  public static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService();
    }
    return VerificationService.instance;
  }

  // Company Verification
  async submitCompanyVerification(companyData: any): Promise<CompanyVerification | null> {
    try {
      // Create company record
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyData.name,
          address: companyData.address,
          tin: companyData.tin,
          business_registration_number: companyData.businessRegistrationNumber,
          primary_contact_name: companyData.primaryContact.name,
          primary_contact_email: companyData.primaryContact.email,
          primary_contact_phone: companyData.primaryContact.phone,
          status: 'pending'
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Upload and verify documents
      const documents = await this.uploadVerificationDocuments(
        company.id,
        'company',
        companyData.documents
      );

      // Create verification record
      const verification: CompanyVerification = {
        id: `cv_${company.id}`,
        companyId: company.id,
        companyName: companyData.name,
        tin: companyData.tin,
        businessRegistrationNumber: companyData.businessRegistrationNumber,
        address: companyData.address,
        primaryContact: companyData.primaryContact,
        documents,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      // Create verification workflow
      await this.createVerificationWorkflow('company', company.id, verification);

      // Notify admin
      await this.notifyAdminVerification('company', company.id, verification);

      return verification;
    } catch (error) {
      console.error('Error submitting company verification:', error);
      return null;
    }
  }

  // Vehicle Verification
  async submitVehicleVerification(vehicleData: any): Promise<VehicleVerification | null> {
    try {
      // Create vehicle record
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
          company_id: vehicleData.ownerType === 'fleet' ? vehicleData.ownerId : null,
          type: vehicleData.type,
          registration_number: vehicleData.registrationNumber,
          weight_capacity: vehicleData.weightCapacity,
          volume_capacity: vehicleData.volumeCapacity,
          driver_name: vehicleData.driver.name,
          driver_mobile: vehicleData.driver.phone,
          driver_license_number: vehicleData.driver.licenseNumber,
          status: 'pending'
        })
        .select()
        .single();

      if (vehicleError) throw vehicleError;

      // Upload and verify documents
      const documents = await this.uploadVerificationDocuments(
        vehicle.id,
        'vehicle',
        vehicleData.documents
      );

      // Create verification record
      const verification: VehicleVerification = {
        id: `vv_${vehicle.id}`,
        vehicleId: vehicle.id,
        registrationNumber: vehicleData.registrationNumber,
        vehicleType: vehicleData.type,
        ownerType: vehicleData.ownerType,
        ownerId: vehicleData.ownerId,
        documents,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      // Create verification workflow
      await this.createVerificationWorkflow('vehicle', vehicle.id, verification);

      // Notify admin
      await this.notifyAdminVerification('vehicle', vehicle.id, verification);

      return verification;
    } catch (error) {
      console.error('Error submitting vehicle verification:', error);
      return null;
    }
  }

  // Driver Verification
  async submitDriverVerification(driverData: any): Promise<DriverVerification | null> {
    try {
      // Create driver record
      const { data: driver, error: driverError } = await supabase
        .from('operators')
        .insert({
          name: driverData.name,
          phone: driverData.phone,
          email: driverData.email,
          license_number: driverData.licenseNumber,
          rating: 0,
          total_deliveries: 0,
          successful_deliveries: 0,
          on_time_rate: 0,
          earnings: 0,
          status: 'offline'
        })
        .select()
        .single();

      if (driverError) throw driverError;

      // Upload and verify documents
      const documents = await this.uploadVerificationDocuments(
        driver.id,
        'driver',
        driverData.documents
      );

      // Create verification record
      const verification: DriverVerification = {
        id: `dv_${driver.id}`,
        driverId: driver.id,
        name: driverData.name,
        licenseNumber: driverData.licenseNumber,
        phone: driverData.phone,
        email: driverData.email,
        documents,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      // Create verification workflow
      await this.createVerificationWorkflow('driver', driver.id, verification);

      // Notify admin
      await this.notifyAdminVerification('driver', driver.id, verification);

      return verification;
    } catch (error) {
      console.error('Error submitting driver verification:', error);
      return null;
    }
  }

  // Admin Approval Process
  async approveVerification(
    verificationId: string,
    adminId: string,
    type: 'company' | 'vehicle' | 'driver',
    notes?: string
  ): Promise<boolean> {
    try {
      const verification = await this.getVerificationById(verificationId, type);
      if (!verification) return false;

      // Update verification status
      await this.updateVerificationStatus(verificationId, type, 'approved', adminId, notes);

      // Generate VCODE for vehicles
      if (type === 'vehicle') {
        const vcode = await this.generateVCODE(verification.entityId);
        await this.assignVCODE(verification.entityId, vcode);
      }

      // Activate entity
      await this.activateEntity(verification.entityId, type);

      // Notify applicant
      await this.notifyApproval(verification, type);

      return true;
    } catch (error) {
      console.error('Error approving verification:', error);
      return false;
    }
  }

  async rejectVerification(
    verificationId: string,
    adminId: string,
    type: 'company' | 'vehicle' | 'driver',
    reason: string
  ): Promise<boolean> {
    try {
      const verification = await this.getVerificationById(verificationId, type);
      if (!verification) return false;

      // Update verification status
      await this.updateVerificationStatus(verificationId, type, 'rejected', adminId, reason);

      // Notify applicant
      await this.notifyRejection(verification, type, reason);

      return true;
    } catch (error) {
      console.error('Error rejecting verification:', error);
      return false;
    }
  }

  // Document Verification
  async verifyDocument(
    documentId: string,
    adminId: string,
    status: 'verified' | 'rejected',
    notes?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('verification_documents')
        .update({
          status,
          verified_at: status === 'verified' ? new Date().toISOString() : null,
          verified_by: adminId,
          rejected_reason: status === 'rejected' ? notes : null
        })
        .eq('id', documentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error verifying document:', error);
      return false;
    }
  }

  // TIN Verification
  async verifyTIN(tin: string): Promise<{ valid: boolean; companyName?: string; error?: string }> {
    try {
      // Integration with government TIN verification API
      // This is a mock implementation
      const mockResponse = {
        valid: tin.length === 11 && /^\d+$/.test(tin),
        companyName: tin.length === 11 ? `Company ${tin}` : undefined
      };

      return mockResponse;
    } catch (error) {
      console.error('Error verifying TIN:', error);
      return { valid: false, error: 'TIN verification failed' };
    }
  }

  // Business Registration Verification
  async verifyBusinessRegistration(registrationNumber: string): Promise<{ valid: boolean; error?: string }> {
    try {
      // Integration with business registration verification API
      // This is a mock implementation
      const valid = registrationNumber.length >= 8 && /^[A-Z0-9]+$/.test(registrationNumber);
      
      return { valid };
    } catch (error) {
      console.error('Error verifying business registration:', error);
      return { valid: false, error: 'Business registration verification failed' };
    }
  }

  // Vehicle RC Verification
  async verifyVehicleRC(registrationNumber: string): Promise<{ valid: boolean; vehicleDetails?: any; error?: string }> {
    try {
      // Integration with RTO database
      // This is a mock implementation
      const valid = registrationNumber.length >= 10 && /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/.test(registrationNumber);
      
      if (valid) {
        return {
          valid: true,
          vehicleDetails: {
            registrationNumber,
            vehicleType: 'Truck',
            ownerName: 'Mock Owner',
            registrationDate: '2020-01-01'
          }
        };
      }

      return { valid: false };
    } catch (error) {
      console.error('Error verifying vehicle RC:', error);
      return { valid: false, error: 'Vehicle RC verification failed' };
    }
  }

  // Driver License Verification
  async verifyDriverLicense(licenseNumber: string): Promise<{ valid: boolean; driverDetails?: any; error?: string }> {
    try {
      // Integration with RTO database
      // This is a mock implementation
      const valid = licenseNumber.length >= 10 && /^[A-Z]{2}\d{2}\d{4}\d{7}$/.test(licenseNumber);
      
      if (valid) {
        return {
          valid: true,
          driverDetails: {
            licenseNumber,
            name: 'Mock Driver',
            validFrom: '2020-01-01',
            validTo: '2030-01-01',
            vehicleClasses: ['LMV', 'HMV']
          }
        };
      }

      return { valid: false };
    } catch (error) {
      console.error('Error verifying driver license:', error);
      return { valid: false, error: 'Driver license verification failed' };
    }
  }

  // Helper Methods
  private async uploadVerificationDocuments(
    entityId: string,
    type: string,
    documents: any[]
  ): Promise<VerificationDocument[]> {
    const uploadedDocuments: VerificationDocument[] = [];

    for (const doc of documents) {
      // Upload file to storage (S3, Supabase Storage, etc.)
      const fileUrl = await this.uploadFile(doc.file, `${type}/${entityId}/${doc.type}`);
      
      const document: VerificationDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: doc.type,
        fileName: doc.fileName,
        fileUrl,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        status: 'pending'
      };

      // Store document record
      await supabase
        .from('verification_documents')
        .insert({
          id: document.id,
          entity_id: entityId,
          entity_type: type,
          document_type: doc.type,
          file_name: doc.fileName,
          file_url: fileUrl,
          file_size: doc.fileSize,
          mime_type: doc.mimeType,
          status: 'pending'
        });

      uploadedDocuments.push(document);
    }

    return uploadedDocuments;
  }

  private async uploadFile(file: File, path: string): Promise<string> {
    // Mock file upload - in production, use actual storage service
    return `https://storage.trackas.com/${path}/${file.name}`;
  }

  private async createVerificationWorkflow(
    type: string,
    entityId: string,
    verification: any
  ): Promise<void> {
    const steps = this.getVerificationSteps(type);
    
    const workflow: VerificationWorkflow = {
      id: `wf_${entityId}`,
      type: type as any,
      entityId,
      status: 'pending',
      steps,
      currentStep: 0,
      startedAt: new Date().toISOString()
    };

    await supabase
      .from('verification_workflows')
      .insert({
        id: workflow.id,
        type: workflow.type,
        entity_id: entityId,
        status: workflow.status,
        steps: workflow.steps,
        current_step: workflow.currentStep,
        started_at: workflow.startedAt
      });
  }

  private getVerificationSteps(type: string): VerificationStep[] {
    const stepConfigs = {
      company: [
        { name: 'Document Upload', description: 'Upload TIN and business registration documents', required: true },
        { name: 'TIN Verification', description: 'Verify TIN with government database', required: true },
        { name: 'Business Registration Check', description: 'Verify business registration number', required: true },
        { name: 'Document Review', description: 'Admin reviews uploaded documents', required: true },
        { name: 'Approval', description: 'Final approval by admin', required: true }
      ],
      vehicle: [
        { name: 'Document Upload', description: 'Upload RC and insurance documents', required: true },
        { name: 'RC Verification', description: 'Verify vehicle registration with RTO', required: true },
        { name: 'Insurance Check', description: 'Verify insurance validity', required: true },
        { name: 'Document Review', description: 'Admin reviews uploaded documents', required: true },
        { name: 'VCODE Assignment', description: 'Assign unique VCODE to vehicle', required: true },
        { name: 'Approval', description: 'Final approval by admin', required: true }
      ],
      driver: [
        { name: 'Document Upload', description: 'Upload driver license and ID documents', required: true },
        { name: 'License Verification', description: 'Verify driver license with RTO', required: true },
        { name: 'Background Check', description: 'Perform background verification', required: false },
        { name: 'Document Review', description: 'Admin reviews uploaded documents', required: true },
        { name: 'Approval', description: 'Final approval by admin', required: true }
      ]
    };

    const config = stepConfigs[type as keyof typeof stepConfigs] || [];
    
    return config.map((step, index) => ({
      id: `step_${index + 1}`,
      name: step.name,
      description: step.description,
      status: 'pending' as const,
      required: step.required
    }));
  }

  private async notifyAdminVerification(type: string, entityId: string, verification: any): Promise<void> {
    await supabase
      .from('notifications')
      .insert({
        user_id: 'admin',
        user_type: 'admin',
        type: 'info',
        title: `New ${type} verification pending`,
        message: `${type} verification submitted for review`,
        data: { type, entityId, verification }
      });
  }

  private async getVerificationById(verificationId: string, type: string): Promise<any> {
    // Implementation to fetch verification by ID and type
    return null; // Mock implementation
  }

  private async updateVerificationStatus(
    verificationId: string,
    type: string,
    status: string,
    adminId: string,
    notes?: string
  ): Promise<void> {
    // Update verification status in database
    console.log(`Updating ${type} verification ${verificationId} to ${status}`);
  }

  private async generateVCODE(vehicleId: string): Promise<string> {
    // Generate unique VCODE for vehicle
    return `V${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
  }

  private async assignVCODE(vehicleId: string, vcode: string): Promise<void> {
    await supabase
      .from('vehicles')
      .update({ vcode })
      .eq('id', vehicleId);
  }

  private async activateEntity(entityId: string, type: string): Promise<void> {
    const tableMap = {
      company: 'companies',
      vehicle: 'vehicles',
      driver: 'operators'
    };

    const statusMap = {
      company: 'approved',
      vehicle: 'active',
      driver: 'available'
    };

    await supabase
      .from(tableMap[type as keyof typeof tableMap])
      .update({ status: statusMap[type as keyof typeof statusMap] })
      .eq('id', entityId);
  }

  private async notifyApproval(verification: any, type: string): Promise<void> {
    // Send approval notification to applicant
    console.log(`Notifying approval for ${type} verification`);
  }

  private async notifyRejection(verification: any, type: string, reason: string): Promise<void> {
    // Send rejection notification to applicant
    console.log(`Notifying rejection for ${type} verification: ${reason}`);
  }

  // Analytics
  async getVerificationAnalytics(): Promise<any> {
    try {
      const [companyStats, vehicleStats, driverStats] = await Promise.all([
        this.getVerificationStats('company'),
        this.getVerificationStats('vehicle'),
        this.getVerificationStats('driver')
      ]);

      return {
        companies: companyStats,
        vehicles: vehicleStats,
        drivers: driverStats,
        totalPending: companyStats.pending + vehicleStats.pending + driverStats.pending,
        totalApproved: companyStats.approved + vehicleStats.approved + driverStats.approved,
        totalRejected: companyStats.rejected + vehicleStats.rejected + driverStats.rejected
      };
    } catch (error) {
      console.error('Error fetching verification analytics:', error);
      return null;
    }
  }

  private async getVerificationStats(type: string): Promise<any> {
    const { data } = await supabase
      .from(`${type}s`)
      .select('status')
      .in('status', ['pending', 'approved', 'rejected']);

    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    data?.forEach(item => {
      stats[item.status as keyof typeof stats]++;
    });

    return stats;
  }
}

export const verificationService = VerificationService.getInstance();
