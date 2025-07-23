import React, { useState } from "react";
import { UserRole } from "../../context/AuthContext";
import LogisticsLogin from "./LogisticsLogin";
import OperatorLogin from "./OperatorLogin";
import CustomerLogin from "./CustomerLogin";
import { Building2, Truck, User, ArrowLeft } from "lucide-react";

interface LoginProps {
  onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ onBack }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  if (selectedRole) {
    const LoginComponent = {
      logistics: LogisticsLogin,
      operator: OperatorLogin,
      customer: CustomerLogin,
    }[selectedRole];

    return <LoginComponent onBack={() => setSelectedRole(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          )}

          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to TruckFlow
            </h1>
            <p className="text-gray-600">Select your role to continue</p>
          </div>

          <div className="space-y-4">
            {/* Logistics Company Login */}
            <button
              onClick={() => setSelectedRole("logistics")}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className="bg-blue-100 group-hover:bg-blue-200 w-12 h-12 rounded-lg flex items-center justify-center mr-4 transition-colors">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">
                    Logistics Company
                  </h3>
                  <p className="text-sm text-gray-600">
                    Manage shipments and operations
                  </p>
                </div>
              </div>
            </button>

            {/* Transport Operator Login */}
            <button
              onClick={() => setSelectedRole("operator")}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className="bg-green-100 group-hover:bg-green-200 w-12 h-12 rounded-lg flex items-center justify-center mr-4 transition-colors">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">
                    Transport Operator
                  </h3>
                  <p className="text-sm text-gray-600">
                    Accept and manage deliveries
                  </p>
                </div>
              </div>
            </button>

            {/* Customer Login */}
            <button
              onClick={() => setSelectedRole("customer")}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className="bg-purple-100 group-hover:bg-purple-200 w-12 h-12 rounded-lg flex items-center justify-center mr-4 transition-colors">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Customer</h3>
                  <p className="text-sm text-gray-600">Track your shipments</p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              New to TruckFlow?{" "}
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Contact us for registration
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
