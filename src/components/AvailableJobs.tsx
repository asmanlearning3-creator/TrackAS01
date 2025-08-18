import React, { useState, useEffect } from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
  CreditCard, 
  CheckCircle, 
  XCircle,
  Navigation,
  Phone,
  User,
  AlertTriangle,
  Zap,
  Filter,
  Search,
  Star
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDatabase } from '../context/DatabaseContext';
import LoadingSpinner from './LoadingSpinner';

const AvailableJobs: React.FC = () => {
  const { state, dispatch } = useApp();
  const { shipments, updateShipmentStatus, addShipmentUpdate } = useDatabase();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'standard' | 'urgent' | 'express'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);

  // Get available jobs (pending shipments)
  const availableJobs = shipments?.filter(s => s.status === 'pending') || [];
  
  const filteredJobs = availableJobs.filter(job => {
    const matchesUrgency = filterUrgency === 'all' || job.urgency === filterUrgency;
    const matchesSearch = searchTerm === '' || 
      job.pickup_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.destination_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesUrgency && matchesSearch;
  });

  const handleAcceptJob = async (jobId: string) => {
    setIsAccepting(true);
    
    try {
      // Update shipment status to assigned
      await updateShipmentStatus(jobId, 'assigned', 'Shipment accepted by operator');
      
      // Add shipment update
      await addShipmentUpdate(
        jobId, 
        'Operator has accepted the shipment and is preparing for pickup', 
        'success'
      );

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `NOT-${Date.now()}`,
          type: 'success',
          title: 'Job Accepted',
          message: `You have successfully accepted shipment ${jobId}`,
          timestamp: 'Just now',
          read: false
        }
      });

      setSelectedJob(null);
    } catch (error) {
      console.error('Failed to accept job:', error);
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `NOT-${Date.now()}`,
          type: 'error',
          title: 'Job Acceptance Failed',
          message: 'Failed to accept the job. Please try again.',
          timestamp: 'Just now',
          read: false
        }
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectJob = (jobId: string) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `NOT-${Date.now()}`,
        type: 'info',
        title: 'Job Declined',
        message: `You have declined shipment ${jobId}`,
        timestamp: 'Just now',
        read: false
      }
    });
    setSelectedJob(null);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'express': return 'text-red-600 bg-red-50 border-red-200';
      case 'urgent': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const calculateEstimatedEarnings = (job: any) => {
    const baseRate = 500; // Base rate per shipment
    const distanceRate = job.distance_km ? job.distance_km * 10 : 250; // ₹10 per km
    const urgencyMultiplier = job.urgency === 'express' ? 2 : job.urgency === 'urgent' ? 1.5 : 1;
    
    return Math.round((baseRate + distanceRate) * urgencyMultiplier);
  };

  const selectedJobData = selectedJob ? filteredJobs.find(j => j.id === selectedJob) : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Jobs</h2>
            <p className="text-gray-600">Browse and accept shipment assignments based on your preferences</p>
          </div>
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-700 font-medium">{filteredJobs.length} Jobs Available</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Urgency</option>
                <option value="standard">Standard</option>
                <option value="urgent">Urgent</option>
                <option value="express">Express</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Jobs Available</h3>
                  <p className="text-gray-600">Check back later for new shipment assignments</p>
                </div>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const estimatedEarnings = calculateEstimatedEarnings(job);
                const isSelected = selectedJob === job.id;
                
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job.id)}
                    className={`bg-white rounded-xl shadow-sm border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-green-500 shadow-md' 
                        : 'border-gray-100 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <Package className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{job.id}</h3>
                            <p className="text-sm text-gray-600">{job.customer_name}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(job.urgency)}`}>
                            {job.urgency.toUpperCase()}
                          </div>
                          <p className="text-lg font-bold text-green-600 mt-1">₹{estimatedEarnings.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Pickup</span>
                          </div>
                          <p className="text-sm text-green-700">{job.pickup_address}</p>
                        </div>
                        
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <MapPin className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-800">Destination</span>
                          </div>
                          <p className="text-sm text-red-700">{job.destination_address}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Package className="h-4 w-4" />
                            <span>{job.weight} kg</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{job.estimated_delivery ? new Date(job.estimated_delivery).toLocaleDateString() : 'ASAP'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Navigation className="h-4 w-4" />
                          <span>{job.distance_km || 250} km</span>
                        </div>
                      </div>

                      {job.special_handling && (
                        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">Special Handling</span>
                          </div>
                          <p className="text-sm text-yellow-700 mt-1">{job.special_handling}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Job Details */}
        <div>
          {selectedJobData ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Shipment ID</label>
                  <p className="text-gray-900 font-mono">{selectedJobData.id}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Customer Information</label>
                  <div className="bg-gray-50 rounded-lg p-3 mt-1">
                    <p className="font-medium">{selectedJobData.customer_name}</p>
                    <p className="text-sm text-gray-600">{selectedJobData.customer_phone}</p>
                    <p className="text-sm text-gray-600">{selectedJobData.customer_email}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Package Details</label>
                  <div className="bg-gray-50 rounded-lg p-3 mt-1 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Weight:</span>
                      <span className="text-sm font-medium">{selectedJobData.weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Dimensions:</span>
                      <span className="text-sm font-medium">{selectedJobData.dimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Value:</span>
                      <span className="text-sm font-medium">₹{selectedJobData.price?.toLocaleString() || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Estimated Earnings</label>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-1">
                    <p className="text-2xl font-bold text-green-600">₹{calculateEstimatedEarnings(selectedJobData).toLocaleString()}</p>
                    <p className="text-sm text-green-700">Including distance and urgency bonus</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Route Information</label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Navigation className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Estimated Distance: {selectedJobData.distance_km || 250} km</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Estimated Duration: 4-5 hours</span>
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">AI Insights</span>
                  </div>
                  <div className="space-y-2 text-xs text-purple-800">
                    <div className="flex items-center space-x-2">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>High-value customer (4.8★ rating)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Navigation className="h-3 w-3 text-blue-500" />
                      <span>Optimal route available with minimal traffic</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-green-500" />
                      <span>95% on-time delivery probability</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleAcceptJob(selectedJobData.id)}
                    disabled={isAccepting}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isAccepting ? (
                      <>
                        <LoadingSpinner size="sm" text="" />
                        <span>Accepting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Accept Job</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleRejectJob(selectedJobData.id)}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Decline</span>
                  </button>

                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Contact Customer</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-center text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a job to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableJobs;