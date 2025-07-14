import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CreateShipment from './components/CreateShipment';
import LiveTracking from './components/LiveTracking';
import Analytics from './components/Analytics';
import OperatorManagement from './components/OperatorManagement';
import RoleSelector from './components/RoleSelector';
import CompanyRegistration from './components/CompanyRegistration';
import VehicleRegistration from './components/VehicleRegistration';
import VerificationDashboard from './components/VerificationDashboard';
import OperationalFlow from './components/OperationalFlow';

function App() {
  const [userRole, setUserRole] = useState<'logistics' | 'operator' | 'customer' | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleRoleSelect = (role: 'logistics' | 'operator' | 'customer') => {
    setUserRole(role);
    setActiveTab('dashboard');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard userRole={userRole!} onTabChange={handleTabChange} />;
      case 'create-shipment':
        return <CreateShipment />;
      case 'operators':
        return <OperatorManagement />;
      case 'tracking':
      case 'my-shipments':
      case 'available-jobs':
      case 'active-shipments':
        return <LiveTracking />;
      case 'analytics':
        return <Analytics />;
      case 'company-registration':
        return <CompanyRegistration />;
      case 'vehicle-registration':
        return <VehicleRegistration />;
      case 'verification':
        return <VerificationDashboard />;
      case 'operational-flow':
        return <OperationalFlow />;
      default:
        return <Dashboard userRole={userRole!} onTabChange={handleTabChange} />;
    }
  };

  if (!userRole) {
    return <RoleSelector onRoleSelect={handleRoleSelect} />;
  }

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          userRole={userRole}
        />
        
        <div className="flex">
          <Sidebar 
            isOpen={sidebarOpen}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            userRole={userRole}
          />
          
          <main className="flex-1 lg:ml-64">
            {renderContent()}
          </main>
        </div>
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </AppProvider>
  );
}

export default App;