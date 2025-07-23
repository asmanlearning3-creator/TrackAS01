import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { DatabaseProvider } from './context/DatabaseContext';
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
import Login from './components/auth/Login';
import LoadingSpinner from './components/LoadingSpinner';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard userRole={user!.role!} onTabChange={handleTabChange} />;
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
        return <Dashboard userRole={user!.role!} onTabChange={handleTabChange} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show demo mode option if user is not authenticated
  if (!user) {
    if (showDemo) {
      return <RoleSelector onRoleSelect={() => {}} />;
    }

    return (
      <div className="min-h-screen">
        <Login onBack={() => setShowDemo(false)} />
        
        {/* Demo Mode Option */}
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => setShowDemo(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors text-sm"
          >
            Try Demo Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <DatabaseProvider userId={user.id} userType={user.role === 'logistics' ? 'company' : 'user'}>
      <AppProvider>
        <div className="min-h-screen bg-gray-50">
          <Header 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            userRole={user.role!}
          />
          
          <div className="flex">
            <Sidebar 
              isOpen={sidebarOpen}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              userRole={user.role!}
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
    </DatabaseProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;