import React from "react";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";
import { isConnected } from "../lib/supabase";

export const ConnectionStatus: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Checking...</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
        isConnected
          ? "bg-green-100 text-green-800"
          : "bg-yellow-100 text-yellow-800"
      }`}
    >
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Online</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-4 h-4" />
          <span>Demo Mode</span>
        </>
      )}
    </div>
  );
};

export default ConnectionStatus;
