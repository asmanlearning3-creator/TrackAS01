import React, { useState } from "react";
import {
  Truck,
  User,
  FileText,
  Shield,
  CheckCircle,
  AlertCircle,
  Hash,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Vehicle } from "../types";

const VehicleRegistration: React.FC = () => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    companyId: "",
    vehicleType: "truck",
    registrationNumber: "",
    weightCapacity: "",
    volumeCapacity: "",
    driverName: "",
    driverMobile: "",
    driverLicenseNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get approved companies for selection
  const approvedCompanies =
    state.companies?.filter((c) => c.status === "approved") || [];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyId) newErrors.companyId = "Please select a company";
    if (!formData.registrationNumber.trim())
      newErrors.registrationNumber = "Vehicle registration number is required";
    if (!formData.weightCapacity || parseFloat(formData.weightCapacity) <= 0) {
      newErrors.weightCapacity = "Valid weight capacity is required";
    }
    if (!formData.volumeCapacity || parseFloat(formData.volumeCapacity) <= 0) {
      newErrors.volumeCapacity = "Valid volume capacity is required";
    }
    if (!formData.driverName.trim())
      newErrors.driverName = "Driver name is required";
    if (!formData.driverMobile.trim())
      newErrors.driverMobile = "Driver mobile number is required";
    if (!formData.driverLicenseNumber.trim())
      newErrors.driverLicenseNumber = "Driver license number is required";

    // Phone validation
    const phoneRegex = /^[+]?[\d\s-()]+$/;
    if (formData.driverMobile && !phoneRegex.test(formData.driverMobile)) {
      newErrors.driverMobile = "Please enter a valid mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateVCODE = (): string => {
    const prefix = "VC";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newVehicle: Vehicle = {
      id: `VEH-${Date.now()}`,
      companyId: formData.companyId,
      vcode: generateVCODE(),
      type: formData.vehicleType as Vehicle["type"],
      registrationNumber: formData.registrationNumber.toUpperCase(),
      capacity: {
        weight: parseFloat(formData.weightCapacity),
        volume: parseFloat(formData.volumeCapacity),
      },
      driver: {
        name: formData.driverName,
        mobile: formData.driverMobile,
        licenseNumber: formData.driverLicenseNumber.toUpperCase(),
      },
      status: "pending",
      verificationStatus: {
        registrationVerified: false,
        insuranceVerified: false,
        licenseVerified: false,
      },
      registrationDate: new Date().toISOString(),
      availability: "available",
    };

    dispatch({ type: "ADD_VEHICLE_REGISTRATION", payload: newVehicle });
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: {
        id: `NOT-${Date.now()}`,
        type: "success",
        title: "Vehicle Registration Submitted",
        message: `Vehicle ${newVehicle.registrationNumber} registered successfully. VCODE: ${newVehicle.vcode}`,
        timestamp: "Just now",
        read: false,
      },
    });

    setIsSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const resetForm = () => {
    setFormData({
      companyId: "",
      vehicleType: "truck",
      registrationNumber: "",
      weightCapacity: "",
      volumeCapacity: "",
      driverName: "",
      driverMobile: "",
      driverLicenseNumber: "",
    });
    setErrors({});
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Vehicle Registration Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Your vehicle has been registered and is pending verification. You
              will receive updates within 24-48 hours.
            </p>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Verification Process
              </h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">
                    Vehicle Registration Verification
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">
                    Insurance Verification (Optional but recommended)
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">
                    Driver License Cross-Check
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">
                    VCODE Activation & Shipment Assignment
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={resetForm}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Register Another Vehicle
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Vehicle Registration
            </h2>
            <p className="text-gray-600">
              Register vehicles for your approved logistics company
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            <img
              src="/Vipul.png"
              alt="Vipul Sharma"
              className="h-5 w-5 rounded-full object-cover"
            />
            <span className="text-xs text-purple-700 font-medium">
              Docs by Vipul Sharma
            </span>
          </div>
        </div>
      </div>

      {approvedCompanies.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">
                No Approved Companies
              </h3>
              <p className="text-yellow-700">
                You need to have an approved company registration before
                registering vehicles.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Company Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Company Selection
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Company *
              </label>
              <select
                name="companyId"
                value={formData.companyId}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.companyId ? "border-red-500" : "border-gray-300"
                }`}
                disabled={approvedCompanies.length === 0}
              >
                <option value="">Select a company</option>
                {approvedCompanies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              {errors.companyId && (
                <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>
              )}
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Truck className="h-5 w-5 mr-2 text-blue-600" />
              Vehicle Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type *
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="bike">Bike</option>
                  <option value="car">Car</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Registration Number *
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.registrationNumber
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="e.g., HR-26-AB-1234"
                />
                {errors.registrationNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.registrationNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight Capacity (kg) *
                </label>
                <input
                  type="number"
                  name="weightCapacity"
                  value={formData.weightCapacity}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.weightCapacity ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter weight capacity"
                  min="1"
                />
                {errors.weightCapacity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.weightCapacity}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume Capacity (m³) *
                </label>
                <input
                  type="number"
                  name="volumeCapacity"
                  value={formData.volumeCapacity}
                  onChange={handleChange}
                  step="0.1"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.volumeCapacity ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter volume capacity"
                  min="0.1"
                />
                {errors.volumeCapacity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.volumeCapacity}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Driver Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Driver Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver's Name *
                </label>
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.driverName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter driver's full name"
                />
                {errors.driverName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.driverName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver's Mobile Number *
                </label>
                <input
                  type="tel"
                  name="driverMobile"
                  value={formData.driverMobile}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.driverMobile ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter mobile number"
                />
                {errors.driverMobile && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.driverMobile}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver's License Number *
                </label>
                <input
                  type="text"
                  name="driverLicenseNumber"
                  value={formData.driverLicenseNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.driverLicenseNumber
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter license number"
                />
                {errors.driverLicenseNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.driverLicenseNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* VCODE Information */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
              <Hash className="h-5 w-5 mr-2 text-purple-600" />
              VCODE System
            </h3>
            <div className="space-y-3 text-purple-800">
              <p className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>
                  Each approved vehicle receives a unique VCODE for automatic
                  shipment assignment
                </span>
              </p>
              <p className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>
                  VCODE is generated after successful verification (24-48 hours)
                </span>
              </p>
              <p className="flex items-center space-x-2">
                <Truck className="h-4 w-4" />
                <span>
                  Shipments are automatically assigned to available registered
                  vehicles
                </span>
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={approvedCompanies.length === 0}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Register Vehicle
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VehicleRegistration;
