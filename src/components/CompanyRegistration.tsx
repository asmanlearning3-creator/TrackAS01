import React, { useState } from 'react';
import { Building2, FileText, User, Phone, Mail, MapPin, Hash, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import LoadingSpinner from './LoadingSpinner';

const CompanyRegistration: React.FC = () => {
  const { actions } = useDatabase();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    tin: '',
    businessRegistrationNumber: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    fleetSize: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!formData.companyAddress.trim()) newErrors.companyAddress = 'Company address is required';
    }

    if (step === 2) {
      if (!formData.tin.trim()) newErrors.tin = 'TIN is required';
      if (!formData.businessRegistrationNumber.trim()) newErrors.businessRegistrationNumber = 'Business registration number is required';
    }

    if (step === 3) {
      if (!formData.primaryContactName.trim()) newErrors.primaryContactName = 'Primary contact name is required';
      if (!formData.primaryContactEmail.trim()) newErrors.primaryContactEmail = 'Email is required';
      if (!formData.primaryContactPhone.trim()) newErrors.primaryContactPhone = 'Phone number is required';
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.primaryContactEmail && !emailRegex.test(formData.primaryContactEmail)) {
        newErrors.primaryContactEmail = 'Please enter a valid email address';
      }
      
      // Phone validation
      const phoneRegex = /^[+]?[\d\s-()]+$/;
      if (formData.primaryContactPhone && !phoneRegex.test(formData.primaryContactPhone)) {
        newErrors.primaryContactPhone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3) || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const newCompany = {
        name: formData.companyName,
        address: formData.companyAddress,
        tin: formData.tin,
        business_registration_number: formData.businessRegistrationNumber,
        primary_contact_name: formData.primaryContactName,
        primary_contact_email: formData.primaryContactEmail,
        primary_contact_phone: formData.primaryContactPhone,
        fleet_size: formData.fleetSize ? parseInt(formData.fleetSize) : null,
      };

      const createdCompany = await actions.createCompany(newCompany);

      await actions.createNotification({
        type: 'success',
        title: 'Registration Submitted',
        message: `Company registration for ${createdCompany.name} submitted successfully. You will receive updates within 24-48 hours.`,
      });

      setFormData({
        companyName: '',
        companyAddress: '',
        tin: '',
        businessRegistrationNumber: '',
        primaryContactName: '',
        primaryContactEmail: '',
        primaryContactPhone: '',
        fleetSize: '',
      });
      setCurrentStep(4);
    } catch (error) {
      actions.createNotification({
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'Failed to submit company registration. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rest of the component code...

  return (
    // JSX return statement...
  );
};

export default CompanyRegistration;