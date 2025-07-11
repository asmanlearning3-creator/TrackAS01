import React, { useState } from 'react';
import { 
  Truck, 
  Package, 
  MapPin, 
  CheckCircle, 
  CreditCard, 
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
  User
} from 'lucide-react';

const OperatorOperationalFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);

  const operationalSteps = [
    {
      id: 1,
      title: 'Driver Registration & Verification',
      description: 'Complete registration and document verification',
      icon: User,
      color: 'bg-blue-500',
      status: 'completed',
      details: [
        'Personal information and contact details',
        'Driver license verification and validation',
        'Vehicle registration and insurance documents',
        'Bank account setup for payment processing',
        'Background verification and approval',
        'Mobile app installation and setup'
      ],
      actions: [
        { label: 'Update Profile', action: 'profile' },
        { label: 'Document Status', action: 'verification' }
      ]
    },
    {
      id: 2,
      title: 'Job Assignment & Acceptance',
      description: 'Receive and accept shipment assignments',
      icon: Package,
      color: 'bg-green-500',
      status: 'active',
      details: [
        'Real-time job notifications via mobile app',
        'View shipment details and requirements',
        'Check pickup and delivery locations',
        'Review payment amount and terms',
        'Accept or decline job assignments',
        'Automatic assignment to next operator if declined'
      ],
      actions: [
        { label: 'View Available Jobs', action: 'available-jobs' },
        { label: 'Job History', action: 'history' }
      ]
    },
    {
      id: 3,
      title: 'Route Planning & Navigation',
      description: 'AI-optimized route planning and navigation',
      icon: Navigation,
      color: 'bg-purple-500',
      status: 'ongoing',
      details: [
        'AI-suggested optimal route calculation',
        'Real-time traffic and weather updates',
        'Alternative route suggestions',
        'Fuel-efficient route optimization',
        'GPS navigation with voice guidance',
        'Emergency contact and support access'
      ],
      actions: [
        { label: 'Current Route', action: 'tracking' },
        { label: 'Navigation Settings', action: 'settings' }
      ]
    },
    {
      id: 4,
      title: 'Pickup Process & Confirmation',
      description: 'Secure pickup and shipment verification',
      icon: MapPin,
      color: 'bg-yellow-500',
      status: 'pending',
      details: [
        'GPS verification of pickup location arrival',
        'Customer/sender identity verification',
        'Package inspection and condition assessment',
        'Weight and dimension verification',
        'Digital pickup confirmation and signature',
        'Photo documentation of package condition'
      ],
      actions: [
        { label: 'Pickup Checklist', action: 'checklist' },
        { label: 'Contact Customer', action: 'contact' }
      ]
    },
    {
      id: 5,
      title: 'Transit Tracking & Updates',
      description: 'Real-time tracking and status updates',
      icon: Truck,
      color: 'bg-indigo-500',
      status: 'automated',
      details: [
        'Continuous GPS location tracking',
        'Automated status updates to system',
        'Real-time notifications to customers',
        'Route deviation alerts and corrections',
        'Rest stop and delay notifications',
        'Emergency assistance and support'
      ],
      actions: [
        { label: 'Update Status', action: 'status-update' },
        { label: 'Emergency Support', action: 'support' }
      ]
    },
    {
      id: 6,
      title: 'Delivery & Proof Collection',
      description: 'Secure delivery and documentation',
      icon: CheckCircle,
      color: 'bg-emerald-500',
      status: 'critical',
      details: [
        'GPS verification of delivery location',
        'Recipient identity verification',
        'Package condition assessment',
        'Digital signature collection',
        'Photo documentation of delivery',
        'Instant upload to TrackAS platform'
      ],
      actions: [
        { label: 'Delivery Process', action: 'delivery' },
        { label: 'Proof Upload', action: 'upload' }
      ]
    },
    {
      id: 7,
      title: 'Payment Processing & Earnings',
      description: 'Automated payment and earnings tracking',
      icon: CreditCard,
      color: 'bg-pink-500',
      status: 'automated',
      details: [
        'Automatic payment calculation based on delivery',
        'Real-time earnings tracking and updates',
        'Direct bank transfer processing',
        'Payment history and transaction records',
        'Tax documentation and reporting',
        'Bonus and incentive calculations'
      ],
      actions: [
        { label: 'View Earnings', action: 'earnings' },
        { label: 'Payment History', action: 'payments' }
      ]
    },
    {
      id: 8,
      title: 'Performance & Feedback',
      description: 'Performance tracking and improvement',
      icon: Star,
      color: 'bg-teal-500',
      status: 'continuous',
      details: [
        'Customer rating and feedback collection',
        'Delivery performance metrics tracking',
        'On-time delivery rate monitoring',
        'Fuel efficiency and route optimization',
        'Safety record and incident tracking',
        'Performance improvement recommendations'
      ],
      actions: [
        { label: 'Performance Dashboard', action: 'performance' },
        { label: 'Feedback History', action: 'feedback' }
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
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
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
      case 'critical': return AlertCircle;
      case 'continuous': return Star;
      default: return AlertCircle;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Operator Operational Flow</h2>
            <p className="text-gray-600">Complete workflow for vehicle operators and drivers</p>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            <Truck className="h-4 w-4 text-green-600" />
            <span className="text-xs text-green-700 font-medium">Operator Workflow</span>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Overview</h3>
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
                    isActive ? 'text-green-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
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
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
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
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all group"
                      >
                        <span className="font-medium text-green-900">{action.label}</span>
                        <ArrowRight className="h-4 w-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                    <h5 className="font-semibold text-orange-900 mb-2">Step Status</h5>
                    <p className="text-sm text-orange-700">
                      {step.status === 'completed' && 'This step has been completed successfully.'}
                      {step.status === 'active' && 'This step is currently active and requires attention.'}
                      {step.status === 'pending' && 'This step is pending and will be available soon.'}
                      {step.status === 'automated' && 'This step runs automatically in the background.'}
                      {step.status === 'ongoing' && 'This step is continuously running.'}
                      {step.status === 'critical' && 'This step is critical for successful delivery.'}
                      {step.status === 'continuous' && 'This step provides ongoing performance tracking.'}
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
          <p className="text-xs text-gray-500">Operator Workflow</p>
        </div>
        
        <button
          onClick={() => setActiveStep(Math.min(operationalSteps.length, activeStep + 1))}
          disabled={activeStep === operationalSteps.length}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span>Next Step</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default OperatorOperationalFlow;