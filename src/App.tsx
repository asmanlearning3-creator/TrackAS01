import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DatabaseProvider } from './context/DatabaseContext';
import AuthLogin from './components/AuthLogin';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CreateShipment from './components/CreateShipment';
import LiveTracking from './components/LiveTracking';
import LiveTrackingMap from './components/LiveTrackingMap';
import Analytics from './components/Analytics';
import OperatorManagement from './components/OperatorManagement';
import ShipmentApproval from './components/ShipmentApproval';
import AIRouteOptimizer from './components/AIRouteOptimizer';
import RoleSelector from './components/RoleSelector';
import CompanyRegistration from './components/CompanyRegistration';
import VehicleRegistration from './components/VehicleRegistration';
import VerificationDashboard from './components/VerificationDashboard';
import OperationalFlow from './components/OperationalFlow';

const AppContent: React.FC = () => {
  const { state: authState } = useAuth();
  const [userRole, setUserRole] = useState<'admin' | 'logistics' | 'operator' | 'customer' | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      setUserRole(authState.user.role);
    }
  }, [authState]);

  const handleLogin = (role: 'admin' | 'logistics' | 'operator' | 'customer', userData: any) => {
    setUserRole(role);
    setActiveTab('dashboard');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    // Admin-specific content
    if (userRole === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'approvals':
          return <ShipmentApproval userRole="admin" />;
        case 'verification':
          return <VerificationDashboard />;
        case 'analytics':
          return <Analytics />;
        default:
          return <AdminDashboard />;
      }
    }

    // Regular user content
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard userRole={userRole!} onTabChange={handleTabChange} />;
      case 'create-shipment':
        return <CreateShipment />;
      case 'shipment-approval':
        return <ShipmentApproval userRole={userRole as 'logistics'} />;
      case 'operators':
        return <OperatorManagement />;
      case 'tracking':
      case 'my-shipments':
      case 'available-jobs':
      case 'active-shipments':
        return <LiveTracking />;
      case 'live-map':
        return <LiveTrackingMap shipmentId="TAS-2024-001" />;
      case 'route-optimizer':
        return (
          <AIRouteOptimizer
            pickup={{ lat: 28.6139, lng: 77.2090, address: 'Delhi, India' }}
            destination={{ lat: 19.0760, lng: 72.8777, address: 'Mumbai, India' }}
            vehicleType="truck"
            urgency="standard"
            onRouteSelect={(route) => console.log('Selected route:', route)}
          />
        );
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

  // Show login if not authenticated
  if (!authState.isAuthenticated || !userRole) {
    return <AuthLogin onLogin={handleLogin} />;
  }

  return (
    <DatabaseProvider userId={authState.user?.id} userType="company">
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