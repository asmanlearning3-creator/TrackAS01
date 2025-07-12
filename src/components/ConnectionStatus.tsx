import React from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useConnectionStatus } from '../context/DatabaseContext';

const ConnectionStatus: React.FC = () => {
  const { isConnected, hasErrors, isLoading } = useConnectionStatus();

  const getStatusInfo = () => {
    if (!isConnected) {
      return {
        icon: WifiOff,
        text: 'Disconnected',
        color: 'text-red-600 bg-red-50 border-red-200',
      };
    }
    
    if (hasErrors) {
      return {
        icon: AlertCircle,
        text: 'Connection Issues',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      };
    }
    
    if (isLoading) {
      return {
        icon: Wifi,
        text: 'Syncing...',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
      };
    }
    
    return {
      icon: CheckCircle,
      text: 'Connected',
      color: 'text-green-600 bg-green-50 border-green-200',
    };
  };

  const { icon: Icon, text, color } = getStatusInfo();

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      <span>{text}</span>
      {isConnected && !hasErrors && !isLoading && (
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      )}
    </div>
  );
};

export default ConnectionStatus;