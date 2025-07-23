import React from "react";
import { Plus, Search, BarChart3, Users, MapPin, Bell } from "lucide-react";

interface QuickActionsProps {
  userRole: "logistics" | "operator" | "customer";
  onActionClick: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  userRole,
  onActionClick,
}) => {
  const getActions = () => {
    switch (userRole) {
      case "logistics":
        return [
          {
            id: "create-shipment",
            label: "Create Shipment",
            icon: Plus,
            color: "bg-blue-600 hover:bg-blue-700",
          },
          {
            id: "operators",
            label: "Manage Fleet",
            icon: Users,
            color: "bg-green-600 hover:bg-green-700",
          },
          {
            id: "analytics",
            label: "View Analytics",
            icon: BarChart3,
            color: "bg-purple-600 hover:bg-purple-700",
          },
          {
            id: "tracking",
            label: "Live Tracking",
            icon: MapPin,
            color: "bg-orange-600 hover:bg-orange-700",
          },
        ];
      case "operator":
        return [
          {
            id: "available-jobs",
            label: "View Jobs",
            icon: Search,
            color: "bg-blue-600 hover:bg-blue-700",
          },
          {
            id: "tracking",
            label: "Update Location",
            icon: MapPin,
            color: "bg-green-600 hover:bg-green-700",
          },
          {
            id: "earnings",
            label: "View Earnings",
            icon: BarChart3,
            color: "bg-purple-600 hover:bg-purple-700",
          },
        ];
      case "customer":
        return [
          {
            id: "tracking",
            label: "Track Shipment",
            icon: Search,
            color: "bg-blue-600 hover:bg-blue-700",
          },
          {
            id: "my-shipments",
            label: "My Shipments",
            icon: MapPin,
            color: "bg-green-600 hover:bg-green-700",
          },
          {
            id: "history",
            label: "Order History",
            icon: BarChart3,
            color: "bg-purple-600 hover:bg-purple-700",
          },
        ];
      default:
        return [];
    }
  };

  const actions = getActions();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Bell className="h-5 w-5 mr-2 text-blue-600" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onActionClick(action.id)}
              className={`w-full ${action.color} text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2`}
            >
              <Icon className="h-4 w-4" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
