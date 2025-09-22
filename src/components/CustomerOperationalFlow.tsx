import React, { useState } from 'react';
import { 
  User, 
  Package, 
  MapPin, 
  CheckCircle, 
  Bell,
  Navigation,
  ArrowRight,
  Clock,
  Shield,
  FileText,
  Zap,
  Camera,
  Star,
  AlertCircle,
  Eye,
  Settings,
  Phone,
  Search,
  CreditCard
} from 'lucide-react';

const CustomerOperationalFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);

  const operationalSteps = [
    {
      id: 1,
      title: 'Account Setup & Profile',
      description: 'Create account and set up delivery preferences',
      icon: User,
      color: 'bg-blue-500',
      status: 'completed',
      details: [
        'Account registration with email/phone verification',
        'Personal information and contact details',
        'Delivery address preferences and locations',
        'Notification preferences (SMS, email, app)',
        'Payment method setup and verification',
        'Privacy settings and data preferences'
      ],
      actions: [
        { label: 'Update Profile', action: 'profile' },
        { label: 'Manage Addresses', action: 'addresses' }
      ]
    },
    {
      id: 2,
      title: 'Shipment Booking Request',
      description: 'Request shipment pickup and delivery service',
      icon: Package,
      color: 'bg-green-500',
      status: 'active',
      details: [
        'Enter pickup and delivery addresses',
        'Specify package details and dimensions',
        'Select delivery time preferences',
        'Choose service level (standard, urgent, express)',
        'Add special handling instructions',
        'Review and confirm booking details'
      ],
      actions: [
        { label: 'Book Shipment', action: 'book-shipment' },
        { label: 'Quick Booking', action: 'quick-book' }
      ]
    },
    {
      id: 3,
      title: 'Shipment Confirmation & Assignment',
      description: 'Receive confirmation and operator assignment',
      icon: CheckCircle,
      color: 'bg-purple-500',
      status: 'automated',
      details: [
        'Instant booking confirmation with tracking ID',
        'Automatic operator assignment notification',
        'Estimated pickup and delivery times',
        'Operator contact information and vehicle details',
        'Real-time status updates via preferred channels',
        'Ability to contact operator directly'
      ],
      actions: [
        { label: 'View Confirmation', action: 'confirmation' },
        { label: 'Contact Operator', action: 'contact' }
      ]
    },
    {
      id: 4,
      title: 'Real-Time Tracking & Updates',
      description: 'Track shipment progress in real-time',
      icon: Navigation,
      color: 'bg-yellow-500',
      status: 'ongoing',
      details: [
        'Live GPS tracking on interactive map',
        'Real-time location updates every 30 seconds',
        'Milestone notifications (pickup, transit, delivery)',
        'Estimated arrival time updates',
        'Route optimization and delay notifications',
        'Emergency contact and support access'
      ],
      actions: [
        { label: 'Track Shipment', action: 'tracking' },
        { label: 'Share Tracking', action: 'share' }
      ]
    },
    {
      id: 5,
      title: 'Delivery Notifications & Alerts',
      description: 'Receive timely delivery notifications',
      icon: Bell,
      color: 'bg-indigo-500',
      status: 'automated',
      details: [
        'Pickup confirmation notifications',
        'In-transit status updates',
        'Approaching delivery alerts (30 min, 10 min)',
        'Delivery attempt notifications',
        'Successful delivery confirmation',
        'Delivery photo and signature proof'
      ],
      actions: [
        { label: 'Notification Settings', action: 'notifications' },
        { label: 'Alert History', action: 'alerts' }
      ]
    },
    {
      id: 6,
      title: 'Delivery Completion & Verification',
      description: 'Confirm delivery and verify package condition',
      icon: CheckCircle,
      color: 'bg-emerald-500',
      status: 'interactive',
      details: [
        'Delivery confirmation with GPS location',
        'Digital signature and photo proof',
        'Package condition verification',
        'Delivery time and date documentation',
        'Instant receipt and delivery certificate',
        'Issue reporting for damaged/missing items'
      ],
      actions: [
        { label: 'Confirm Delivery', action: 'confirm' },
        { label: 'Report Issue', action: 'report' }
      ]
    },
    {
      id: 7,
      title: 'Payment & Billing',
      description: 'Automated payment processing and billing',
      icon: CreditCard,
      color: 'bg-pink-500',
      status: 'automated',
      details: [
        'Automatic payment processing after delivery',
        'Digital invoice generation and delivery',
        'Payment confirmation and receipt',
        'Multiple payment method support',
        'Billing history and transaction records',
        'Refund processing for service issues'
      ],
      actions: [
        { label: 'View Invoice', action: 'invoice' },
        { label: 'Payment History', action: 'payments' }
      ]
    },
    {
      id: 8,
      title: 'Feedback & Service Rating',
      description: 'Rate service and provide feedback',
      icon: Star,
      color: 'bg-teal-500',
      status: 'optional',
      details: [
        'Service quality rating (1-5 stars)',
        'Operator performance feedback',
        'Delivery experience evaluation',
        'Suggestions for service improvement',
        'Photo reviews and testimonials',
        'Loyalty points and rewards tracking'
      ],
      actions: [
        { label: 'Rate Service', action: 'rate' },
        { label: 'View Rewards', action: 'rewards' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'automated': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ongoing': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'interactive': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'optional': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'active': return Zap;
      case 'automated': return Settings;
      case 'ongoing': return Navigation;
      case 'interactive': return Eye;
      case 'optional': return Star;
      default: return AlertCircle;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Operational Flow</h2>
            <p className="text-gray-600">Complete journey from booking to delivery completion</p>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            <User className="h-4 w-4 text-purple-600" />
            <span className="text-xs text-purple-700 font-medium">Customer Journey</span>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Journey Overview</h3>
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
                    isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
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
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
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
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-all group"
                      >
                        <span className="font-medium text-purple-900">{action.label}</span>
                        <ArrowRight className="h-4 w-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h5 className="font-semibold text-blue-900 mb-2">Step Status</h5>
                    <p className="text-sm text-blue-700">
                      {step.status === 'completed' && 'This step has been completed successfully.'}
                      {step.status === 'active' && 'This step is currently active and requires your attention.'}
                      {step.status === 'automated' && 'This step happens automatically in the background.'}
                      {step.status === 'ongoing' && 'This step provides continuous updates.'}
                      {step.status === 'interactive' && 'This step requires your interaction and confirmation.'}
                      {step.status === 'optional' && 'This step is optional but helps improve our service.'}
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
          <p className="text-xs text-gray-500">Customer Journey</p>
        </div>
        
        <button
          onClick={() => setActiveStep(Math.min(operationalSteps.length, activeStep + 1))}
          disabled={activeStep === operationalSteps.length}
          className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span>Next Step</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CustomerOperationalFlow;