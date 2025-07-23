import React, { useState } from "react";
import {
  MapPin,
  Navigation,
  Clock,
  Package,
  Phone,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";

const LiveTracking: React.FC = () => {
  const { state, dispatch } = useApp();
  const [selectedShipment, setSelectedShipment] = useState(
    state.selectedShipment || state.shipments[0]?.id || "",
  );

  const currentShipment = state.shipments.find(
    (s) => s.id === selectedShipment,
  );

  const handleShipmentSelect = (shipmentId: string) => {
    setSelectedShipment(shipmentId);
    dispatch({ type: "SELECT_SHIPMENT", payload: shipmentId });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-50";
      case "in_transit":
        return "text-blue-600 bg-blue-50";
      case "picked_up":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "in_transit":
        return "In Transit";
      case "picked_up":
        return "Picked Up";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Live Tracking</h2>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Real-time tracking of all active shipments with AI-optimized routes.
          </p>
          <div className="hidden md:flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-700 font-medium">
              Live System
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipment List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Active Shipments
            </h3>
            <div className="space-y-3">
              {state.shipments.map((shipment) => (
                <div
                  key={shipment.id}
                  onClick={() => handleShipmentSelect(shipment.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedShipment === shipment.id
                      ? "bg-blue-50 border-2 border-blue-500"
                      : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {shipment.id}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}
                    >
                      {getStatusText(shipment.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {shipment.from} → {shipment.to}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${shipment.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {shipment.progress}% Complete
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tracking Details */}
        <div className="lg:col-span-2">
          {currentShipment && (
            <div className="space-y-6">
              {/* Map Placeholder */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Route Map
                  </h3>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      {currentShipment.currentLocation}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900">
                      Live Map View
                    </p>
                    <p className="text-sm text-gray-600">
                      Real-time GPS tracking with AI-optimized routes
                    </p>
                    <div className="mt-4 flex items-center justify-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">
                          Live Location
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          Optimized Route
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipment Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Shipment Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <Package className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {currentShipment.id}
                        </p>
                        <p className="text-sm text-gray-600">
                          Customer: {currentShipment.customer}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Route
                        </p>
                        <p className="text-sm text-gray-600">
                          {currentShipment.from} → {currentShipment.to}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Status
                        </p>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentShipment.status)}`}
                        >
                          {getStatusText(currentShipment.status)}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Expected Delivery
                        </p>
                        <p className="text-sm text-gray-600">
                          {currentShipment.estimatedDelivery}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {currentShipment.driver}
                        </p>
                        <p className="text-sm text-gray-600">Driver</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Vehicle
                        </p>
                        <p className="text-sm text-gray-600">
                          {currentShipment.vehicle}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Contact
                        </p>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {currentShipment.driverPhone}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Progress
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${currentShipment.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {currentShipment.progress}% Complete
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Timeline Updates
                </h3>

                <div className="space-y-4">
                  {currentShipment.updates.map((update, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div
                        className={`p-1 rounded-full mt-1 ${
                          update.type === "success"
                            ? "bg-green-100"
                            : update.type === "warning"
                              ? "bg-yellow-100"
                              : "bg-blue-100"
                        }`}
                      >
                        {update.type === "success" ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : update.type === "warning" ? (
                          <AlertCircle className="h-3 w-3 text-yellow-600" />
                        ) : (
                          <Clock className="h-3 w-3 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {update.message}
                          </span>
                          <span className="text-xs text-gray-500">
                            {update.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
