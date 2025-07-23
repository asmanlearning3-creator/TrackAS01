import React, { useState, useEffect, useRef } from 'react';
import { Menu, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import ConnectionStatus from './ConnectionStatus';

interface HeaderProps {
  onMenuToggle: () => void;
  userRole: 'logistics' | 'operator' | 'customer';
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, userRole }) => {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'logistics': return 'Logistics Company';
      case 'operator': return 'Operator';
      case 'customer': return 'Customer';
      default: return 'User';
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.firstName && user?.user_metadata?.lastName) {
      return `${user.user_metadata.firstName} ${user.user_metadata.lastName}`;
    }
    return user?.email?.split('@')[0] || 'User';
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
            <ConnectionStatus />
            
            <NotificationCenter />
            
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500">{getRoleDisplayName()}</p>
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-blue-600 mt-1">{getRoleDisplayName()}</p>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Account Settings
                    </button>
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;