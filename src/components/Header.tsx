import React from 'react';
import { Menu } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
  onMenuToggle: () => void;
  userRole: 'logistics' | 'operator' | 'customer';
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, userRole }) => {
  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'logistics': return 'Logistics Company';
      case 'operator': return 'Operator';
      case 'customer': return 'Customer';
      default: return 'User';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3 ml-2 lg:ml-0">
              <div className="bg-white p-1 rounded-lg shadow-sm">
                <img 
                  src="/LOGO.png" 
                  alt="TrackAS Logo" 
                  className="h-8 w-auto"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TrackAS</h1>
                <p className="text-xs text-gray-500">Logistics Platform</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationCenter />
            
            <div className="flex items-center space-x-3">
              <img 
                src="/Vipul.png" 
                alt="Vipul Sharma" 
                className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Vipul Sharma</p>
                <p className="text-xs text-gray-500">{getRoleDisplayName()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;