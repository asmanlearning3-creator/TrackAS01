import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Users, 
  Building2, 
  Truck, 
  Shield, 
  LogIn, 
  FileText, 
  Package, 
  MapPin, 
  CheckCircle, 
  CreditCard, 
  Star,
  Navigation,
  Clock,
  Phone,
  Camera,
  BarChart3,
  Hash,
  Eye,
  Zap,
  Target,
  Globe
} from 'lucide-react';

const OperationalFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const userRoles = [
    {
      title: 'Customer',
      description: 'Tracks consignments in real-time',
      icon: Users,
      color: 'bg-blue-500',
      features: ['Real-time tracking', 'Delivery notifications', 'Order history']
    },
    {
      title: 'Vehicle Operator',
      description: 'Manages assigned shipments',
      icon: Truck,
      color: 'bg-green-500',
      features: ['Job assignments', 'Route optimization', 'Earnings tracking']
    },
    {
      title: 'Logistics Company',
      description: 'Controls shipments, vehicles, and performance',
      icon: Building2,
      color: 'bg-purple-500',
      features: ['Fleet management', 'Analytics dashboard', 'Performance monitoring']
    },
    {
      title: 'TrackAS Admin',
      description: 'Oversees the entire platform',
      icon: Shield,
      color: 'bg-orange-500',
      features: ['System oversight', 'User verification', 'Platform analytics']
    }
  ];

  const operationalSteps = [
    {
      id: 1,
      title: 'Login & Dashboard Access',
      description: 'Secure authentication and role-based dashboard access',
      icon: LogIn,
      color: 'bg-blue-500',
      details: [
        'Clean login interface with email/phone + password',
        'Multi-factor authentication for enhanced security',
        'Role-specific dashboard redirection',
        'Operators see available shipment assignments',
        'Logistics companies access control panel',
        'Admins view comprehensive system metrics'
      ],
      visual: 'Login interface with role-based routing'
    },
    {
      id: 2,
      title: 'Registration & Verification',
      description: 'Comprehensive onboarding for new users',
      icon: FileText,
      color: 'bg-green-500',
      details: [
        'Subscription Model: Company registration with fleet details',
        'Pay-Per-Shipment: Individual operator registration',
        'Document verification: Business, Driver, Vehicle licenses',
        'Bank account verification for payment processing',
        'Automated verification workflow with 24-48 hour timeline',
        'Real-time status updates throughout the process'
      ],
      visual: 'Multi-step registration wizard with document upload'
    },
    {
      id: 3,
      title: 'Shipment Creation',
      description: 'Intelligent shipment booking system',
      icon: Package,
      color: 'bg-purple-500',
      details: [
        'Pickup and destination address input',
        'Consignment weight, volume, and dimensions',
        'Special handling requirements specification',
        'Delivery deadline and urgency level selection',
        'Automated or manual pricing calculation',
        'Customer contact information management'
      ],
      visual: 'Interactive shipment creation form with map integration'
    },
    {
      id: 4,
      title: 'AI-Powered Assignment & Matching',
      description: 'Smart operator matching and assignment system',
      icon: Zap,
      color: 'bg-yellow-500',
      details: [
        'Subscription Model: Automatic VCODE-based vehicle assignment',
        'Pay-Per-Shipment: AI matching by proximity and reliability',
        'Real-time operator availability checking',
        'Automatic fallback to next best operator if declined',
        'Load balancing across fleet for optimal efficiency',
        'Priority handling for urgent shipments'
      ],
      visual: 'Animated matching algorithm with map visualization'
    },
    {
      id: 5,
      title: 'Pickup & Transit Management',
      description: 'Real-time tracking and route optimization',
      icon: Navigation,
      color: 'bg-indigo-500',
      details: [
        'Operator arrival confirmation at pickup location',
        'AI-suggested optimal route navigation',
        'Live GPS tracking with 30-second updates',
        'Automated notifications to company and customer',
        'Traffic and weather-based route adjustments',
        'Emergency contact and support integration'
      ],
      visual: 'Live tracking interface with route optimization'
    },
    {
      id: 6,
      title: 'Delivery Confirmation & Proof',
      description: 'Comprehensive delivery verification system',
      icon: CheckCircle,
      color: 'bg-emerald-500',
      details: [
        'GPS-verified arrival at destination',
        'Digital signature capture from recipient',
        'Photo documentation of delivered items',
        'Condition assessment and damage reporting',
        'Instant upload to TrackAS cloud platform',
        'Automated delivery confirmation notifications'
      ],
      visual: 'Mobile delivery confirmation interface'
    },
    {
      id: 7,
      title: 'Payment Processing',
      description: 'Automated payment and invoicing system',
      icon: CreditCard,
      color: 'bg-pink-500',
      details: [
        'Dynamic pricing based on distance, weight, and urgency',
        'Automated invoice generation and approval workflow',
        'Secure payment processing with multiple methods',
        'Direct bank transfer to operator accounts',
        'Real-time payment status tracking',
        'Comprehensive financial reporting and analytics'
      ],
      visual: 'Payment dashboard with transaction history'
    },
    {
      id: 8,
      title: 'Analytics & Continuous Improvement',
      description: 'Data-driven insights and performance optimization',
      icon: BarChart3,
      color: 'bg-teal-500',
      details: [
        'Customer and operator rating system',
        'Performance analytics: success rate, delivery time',
        'Cost optimization and route efficiency analysis',
        'Predictive analytics for demand forecasting',
        'Comprehensive reporting dashboards',
        'Continuous system improvement based on data insights'
      ],
      visual: 'Interactive analytics dashboard with charts and metrics'
    }
  ];

  const comparisonFeatures = [
    { feature: 'Target Audience', subscription: 'Fleet owners & logistics companies', payPerShipment: 'On-demand businesses & individuals' },
    { feature: 'Vehicle Assignment', subscription: 'Automatic via VCODE system', payPerShipment: 'AI-based best match algorithm' },
    { feature: 'Payment Model', subscription: 'Monthly/Annual subscription', payPerShipment: 'Per-shipment invoice based' },
    { feature: 'Vehicle Ownership', subscription: 'Company-owned fleet', payPerShipment: 'Individual operator vehicles' },
    { feature: 'Multi-vehicle Support', subscription: '✓ Unlimited fleet management', payPerShipment: '✓ Multiple vehicle registration' },
    { feature: 'Bank Account Requirement', subscription: 'Optional for billing', payPerShipment: 'Required for payments' },
    { feature: 'Route Optimization', subscription: '✓ Fleet-wide optimization', payPerShipment: '✓ Individual route planning' },
    { feature: 'Analytics & Reporting', subscription: '✓ Comprehensive fleet analytics', payPerShipment: '✓ Individual performance metrics' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="flex items-center space-x-3 mb-6">
                <img src="/LOGO.png" alt="TrackAS Logo" className="h-12 w-auto" />
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                    TrackAS Operational Flow
                  </h1>
                  <p className="text-xl text-gray-600 mb-2">From Start to Success</p>
                </div>
              </div>
              
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Explore how TrackAS transforms logistics through AI-powered shipment tracking, 
                automated assignments, and real-time analytics. See the complete end-to-end 
                process that revolutionizes supply chain management.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => document.getElementById('operational-steps')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>See How It Works</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all">
                  Get Started
                </button>
              </div>
            </div>
            
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-center space-x-3 mb-6">
                  <Globe className="h-8 w-8" />
                  <h3 className="text-2xl font-bold">Logistics Revolution</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-blue-200" />
                    <span>AI-powered route optimization</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-blue-200" />
                    <span>Real-time tracking & updates</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-blue-200" />
                    <span>Secure payment processing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-blue-200" />
                    <span>Comprehensive analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Who Uses TrackAS?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform serves diverse stakeholders in the logistics ecosystem, 
              each with tailored interfaces and functionalities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {userRoles.map((role, index) => {
              const Icon = role.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className={`${role.color} rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{role.title}</h3>
                  <p className="text-gray-600 mb-6">{role.description}</p>
                  
                  <div className="space-y-2">
                    {role.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Operational Steps Section */}
      <section id="operational-steps" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Complete Operational Flow
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow the journey from user login to successful shipment delivery, 
              powered by cutting-edge technology and seamless user experience.
            </p>
          </div>

          {/* Step Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {operationalSteps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  activeStep === step.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                Step {step.id}
              </button>
            ))}
          </div>

          {/* Active Step Display */}
          {operationalSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`transition-all duration-500 ${
                  activeStep === step.id ? 'opacity-100 block' : 'opacity-0 hidden'
                }`}
              >
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Content */}
                    <div className="p-12">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className={`${step.color} rounded-2xl p-4 flex items-center justify-center`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-1">
                            Step {step.id} of {operationalSteps.length}
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                        </div>
                      </div>
                      
                      <p className="text-lg text-gray-600 mb-8">{step.description}</p>
                      
                      <div className="space-y-4">
                        {step.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Visual */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-12 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`${step.color} rounded-3xl p-8 mb-6 inline-block`}>
                          <Icon className="h-16 w-16 text-white" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Visual Demo</h4>
                        <p className="text-gray-600">{step.visual}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
              className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              <span>Previous Step</span>
            </button>
            
            <div className="flex space-x-2">
              {operationalSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all ${
                    activeStep === idx + 1 ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
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
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Dual Business Models
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              TrackAS supports both subscription-based and pay-per-shipment models 
              to accommodate different business needs and operational structures.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <th className="px-8 py-6 text-left text-lg font-semibold text-gray-900">Feature</th>
                    <th className="px-8 py-6 text-center text-lg font-semibold text-blue-600">
                      <div className="flex items-center justify-center space-x-2">
                        <Building2 className="h-5 w-5" />
                        <span>Subscription Model</span>
                      </div>
                    </th>
                    <th className="px-8 py-6 text-center text-lg font-semibold text-green-600">
                      <div className="flex items-center justify-center space-x-2">
                        <CreditCard className="h-5 w-5" />
                        <span>Pay-Per-Shipment</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-8 py-6 font-medium text-gray-900">{item.feature}</td>
                      <td className="px-8 py-6 text-center text-gray-700">{item.subscription}</td>
                      <td className="px-8 py-6 text-center text-gray-700">{item.payPerShipment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Start Streamlining Your Logistics Today
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using TrackAS to optimize their 
            supply chain operations and deliver exceptional customer experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105">
              Create Shipment
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all">
              Book a Demo
            </button>
          </div>
          
          <div className="mt-12 flex items-center justify-center space-x-2 text-blue-100">
            <span>Founded with ❤️ by</span>
            <img 
              src="/Vipul.png" 
              alt="Vipul Sharma" 
              className="h-8 w-8 rounded-full object-cover border-2 border-blue-300"
            />
            <span className="font-medium text-white">Vipul Sharma - Founder</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OperationalFlow;