import React, { useState } from 'react';
import { 
  Building2, 
  Package, 
  Users, 
  Truck, 
  MapPin, 
  CheckCircle, 
  CreditCard, 
  BarChart3,
  ArrowRight,
  Clock,
  Shield,
  FileText,
  Zap,
  Navigation,
  Camera,
  Star,
  AlertCircle,
  Eye,
  Settings
} from 'lucide-react';

const LogisticsOperationalFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);

  const operationalSteps = [
    {
      id: 1,
      title: 'Company Setup & Registration',
      description: 'Initial setup and verification process',
      icon: Building2,
      color: 'bg-blue-500',
      status: 'completed',
      details: [
        'Register company with business documents',
        'TIN and business registration verification',
        'Primary contact information setup',
        'Fleet size declaration and planning',
        'Bank account verification for billing',
        'Approval within 24-48 hours'
      ],
      actions: [
        { label: 'View Registration', action: 'company-registration' },
        { label: 'Check Status', action: 'verification' }
      ]
    },
    {
      id: 2,
      title: 'Vehicle Fleet Registration',
      description: 'Register and verify your fleet vehicles',
      icon: Truck,
      color: 'bg-green-500',
      status: 'active',
      details: [
        'Register each vehicle with details',
        'Driver information and license verification',
        'Vehicle capacity and specifications',
        'Generate unique VCODE for each vehicle',
        'Insurance verification (recommended)',
        'Automatic assignment capability activation'
      ],
      actions: [
        { label: 'Register Vehicle', action: 'vehicle-registration' },
        { label: 'Manage Fleet', action: 'operators' }
      ]
    },
    {
      id: 3,
      title: 'Shipment Creation & Management',
      description: 'Create and manage customer shipments',
      icon: Package,
      color: 'bg-purple-500',
      status: 'pending',
      details: [
        'Input pickup and destination addresses',
        'Specify consignment weight and dimensions',
        'Set delivery deadlines and urgency levels',
        'Add special handling requirements',
        'Customer contact information management',
        'Automatic pricing calculation (if applicable)'
      ],
      actions: [
        { label: 'Create Shipment', action: 'create-shipment' },
        { label: 'View All Shipments', action: 'tracking' }
      ]
    },
    {
      id: 4,
      title: 'Automatic Vehicle Assignment',
      description: 'AI-powered assignment to optimal vehicles',
      icon: Zap,
      color: 'bg-yellow-500',
      status: 'automated',
      details: [
        'VCODE-based automatic vehicle selection',
        'Proximity and availability checking',
        'Load balancing across fleet',
        'Driver notification and acceptance',
        'Fallback to next available vehicle',
        'Real-time assignment tracking'
      ],
      actions: [
        { label: 'View Assignments', action: 'operators' },
        { label: 'Assignment Rules', action: 'settings' }
      ]
    },
    {
      id: 5,
      title: 'Real-Time Tracking & Monitoring',
      description: 'Monitor shipments and fleet in real-time',
      icon: Navigation,
      color: 'bg-indigo-500',
      status: 'ongoing',
      details: [
        'Live GPS tracking of all vehicles',
        'Route optimization suggestions',
        'Traffic and weather updates',
        'Automated customer notifications',
        'Delivery milestone tracking',
        'Emergency alerts and support'
      ],
      actions: [
        { label: 'Live Tracking', action: 'tracking' },
        { label: 'Fleet Monitor', action: 'operators' }
      ]
    },
    {
      id: 6,
      title: 'Delivery Confirmation & Documentation',
      description: 'Comprehensive delivery verification',
      icon: CheckCircle,
      color: 'bg-emerald-500',
      status: 'automated',
      details: [
        'GPS-verified delivery location',
        'Digital signature collection',
        'Photo documentation of delivery',
        'Condition assessment reporting',
        'Instant cloud upload and storage',
        'Automated completion notifications'
      ],
      actions: [
        { label: 'View Deliveries', action: 'analytics' },
        { label: 'Proof Archive', action: 'tracking' }
      ]
    },
    {
      id: 7,
      title: 'Performance Analytics & Reporting',
      description: 'Comprehensive business intelligence',
      icon: BarChart3,
      color: 'bg-pink-500',
      status: 'continuous',
      details: [
        'Fleet performance metrics',
        'Delivery success rates and timing',
        'Cost analysis and optimization',
        'Driver performance evaluation',
        'Customer satisfaction tracking',
        'Predictive analytics and insights'
      ],
      actions: [
        { label: 'View Analytics', action: 'analytics' },
        { label: 'Generate Reports', action: 'analytics' }
      ]
    },
    {
      id: 8,
      title: 'Continuous Optimization',
      description: 'Data-driven improvements and scaling',
      icon: Settings,
      color: 'bg-teal-500',
      status: 'ongoing',
      details: [
        'Route efficiency optimization',
        'Fleet utilization improvements',
        'Cost reduction strategies',
        'Service quality enhancements',
        'Scalability planning and execution',
        'Technology upgrades and features'
      ],
      actions: [
        { label: 'Optimization Settings', action: 'settings' },
        { label: 'Scale Planning', action: 'analytics' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'automated': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ongoing': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'continuous': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'active': return Zap;
      case 'pending': return Clock;
      case 'automated': return Settings;
      case 'ongoing': return Navigation;
      case 'continuous': return BarChart3;
      default: return AlertCircle;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Logistics Company Operational Flow</h2>
            <p className="text-gray-600">Complete end-to-end process for managing your logistics operations</p>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-blue-700 font-medium">Logistics Operations</span>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Overview</h3>
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          {operationalSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            const isCompleted = step.status === 'completed';
            
            return (
              <div key={step.id} className="flex items-center space-x-4 flex-shrink-0">
                <div
                  onClick={() => setActiveStep(step.id)}
                  className={`flex flex-col items-center cursor-pointer transition-all ${
                    isActive ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? `${step.color} border-transparent text-white` 
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs mt-2 font-medium text-center max-w-20 ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    Step {step.id}
                  </span>
                </div>
                {index < operationalSteps.length - 1 && (
                  <div className={`w-8 h-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Step Details */}
      {operationalSteps.map((step) => {
        const Icon = step.icon;
        const StatusIcon = getStatusIcon(step.status);
        
        return (
          <div
            key={step.id}
            className={`transition-all duration-500 ${
              activeStep === step.id ? 'opacity-100 block' : 'opacity-0 hidden'
            }`}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
                {/* Step Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`${step.color} rounded-2xl p-4 flex items-center justify-center`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(step.status)}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                        </div>
                      </div>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Process Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {step.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    {step.actions.map((action, idx) => (
                      <button
                        key={idx}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all group"
                      >
                        <span className="font-medium text-blue-900">{action.label}</span>
                        <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <h5 className="font-semibold text-purple-900 mb-2">Step Status</h5>
                    <p className="text-sm text-purple-700">
                      {step.status === 'completed' && 'This step has been completed successfully.'}
                      {step.status === 'active' && 'This step is currently active and requires attention.'}
                      {step.status === 'pending' && 'This step is pending and will be available soon.'}
                      {step.status === 'automated' && 'This step runs automatically in the background.'}
                      {step.status === 'ongoing' && 'This step is continuously running.'}
                      {step.status === 'continuous' && 'This step provides ongoing insights and improvements.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
          disabled={activeStep === 1}
          className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span>Previous Step</span>
        </button>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">Step {activeStep} of {operationalSteps.length}</p>
          <p className="text-xs text-gray-500">Logistics Company Operations</p>
        </div>
        
        <button
          onClick={() => setActiveStep(Math.min(operationalSteps.length, activeStep + 1))}
          disabled={activeStep === operationalSteps.length}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span>Next Step</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default LogisticsOperationalFlow;