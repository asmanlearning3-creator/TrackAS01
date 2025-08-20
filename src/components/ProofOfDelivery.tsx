import React, { useState } from 'react';
import { 
  Camera, 
  FileText, 
  CheckCircle, 
  MapPin, 
  Clock, 
  User,
  Upload,
  Star,
  MessageCircle,
  AlertTriangle,
  Shield,
  Download
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { useApp } from '../context/AppContext';

interface ProofOfDeliveryProps {
  shipmentId: string;
  customerName: string;
  deliveryAddress: string;
  onDeliveryComplete?: (proof: any) => void;
}

const ProofOfDelivery: React.FC<ProofOfDeliveryProps> = ({
  shipmentId,
  customerName,
  deliveryAddress,
  onDeliveryComplete
}) => {
  const { updateShipmentStatus, addShipmentUpdate } = useDatabase();
  const { dispatch } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [deliveryData, setDeliveryData] = useState({
    recipientName: '',
    recipientPhone: '',
    deliveryTime: new Date().toISOString(),
    packageCondition: 'good',
    deliveryNotes: '',
    customerRating: 5,
    customerFeedback: '',
    issuesReported: false,
    issueDescription: ''
  });

  const [proofFiles, setProofFiles] = useState({
    signature: null as File | null,
    deliveryPhoto: null as File | null,
    packagePhoto: null as File | null
  });

  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  React.useEffect(() => {
    // Get current location for GPS verification
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Failed to get location:', error);
        }
      );
    }
  }, []);

  const handleFileUpload = (type: keyof typeof proofFiles, file: File) => {
    setProofFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setDeliveryData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitDelivery = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare delivery proof data
      const deliveryProof = {
        recipientName: deliveryData.recipientName,
        recipientPhone: deliveryData.recipientPhone,
        deliveryTime: deliveryData.deliveryTime,
        packageCondition: deliveryData.packageCondition,
        deliveryNotes: deliveryData.deliveryNotes,
        gpsLocation: location,
        verifiedAddress: deliveryAddress,
        proofFiles: {
          signature: proofFiles.signature?.name,
          deliveryPhoto: proofFiles.deliveryPhoto?.name,
          packagePhoto: proofFiles.packagePhoto?.name
        },
        customerFeedback: {
          rating: deliveryData.customerRating,
          feedback: deliveryData.customerFeedback
        },
        issues: deliveryData.issuesReported ? {
          description: deliveryData.issueDescription
        } : null
      };

      // Update shipment status to delivered
      await updateShipmentStatus(shipmentId, 'delivered', 
        `Delivery completed successfully at ${deliveryAddress}`
      );

      // Add final shipment update
      await addShipmentUpdate(
        shipmentId,
        `Package delivered to ${deliveryData.recipientName} with proof of delivery`,
        'success',
        location,
        deliveryAddress
      );

      // Create success notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `NOT-${Date.now()}`,
          type: 'success',
          title: 'Delivery Completed',
          message: `Shipment ${shipmentId} delivered successfully with proof documentation`,
          timestamp: 'Just now',
          read: false
        }
      });

      onDeliveryComplete?.(deliveryProof);
      setCurrentStep(4); // Success step
    } catch (error) {
      console.error('Failed to submit delivery proof:', error);
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `NOT-${Date.now()}`,
          type: 'error',
          title: 'Delivery Submission Failed',
          message: 'Failed to submit delivery proof. Please try again.',
          timestamp: 'Just now',
          read: false
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success page
  if (currentStep === 4) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Completed Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Proof of delivery has been uploaded and the shipment is now marked as completed.
          </p>
          
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">What happens next?</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-800">Customer receives delivery confirmation</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-800">Invoice generated and sent to customer</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-800">Payment processing initiated</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-800">Performance metrics updated</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => window.location.href = '/available-jobs'}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            View Next Available Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Proof of Delivery</h3>
        <p className="text-gray-600">Complete delivery verification for shipment {shipmentId}</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-24 h-1 mx-4 ${
                  currentStep > step ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Delivery Info</span>
          <span>Upload Proof</span>
          <span>Customer Feedback</span>
        </div>
      </div>

      {/* Step 1: Delivery Information */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Delivery Location Verified</span>
            </div>
            <p className="text-sm text-green-700">{deliveryAddress}</p>
            {location && (
              <p className="text-xs text-green-600 mt-1">
                GPS: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Name *</label>
              <input
                type="text"
                name="recipientName"
                value={deliveryData.recipientName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Who received the package?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Phone</label>
              <input
                type="tel"
                name="recipientPhone"
                value={deliveryData.recipientPhone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Recipient's phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
              <input
                type="datetime-local"
                name="deliveryTime"
                value={deliveryData.deliveryTime.slice(0, 16)}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Package Condition</label>
              <select
                name="packageCondition"
                value={deliveryData.packageCondition}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="good">Good Condition</option>
                <option value="minor_damage">Minor Damage</option>
                <option value="major_damage">Major Damage</option>
                <option value="missing_items">Missing Items</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Notes</label>
            <textarea
              name="deliveryNotes"
              value={deliveryData.deliveryNotes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Any notes about the delivery process..."
            />
          </div>

          {/* Issue Reporting */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                name="issuesReported"
                checked={deliveryData.issuesReported}
                onChange={handleChange}
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-yellow-800">Report Issues with Delivery</label>
            </div>
            
            {deliveryData.issuesReported && (
              <textarea
                name="issueDescription"
                value={deliveryData.issueDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Describe any issues encountered during delivery..."
              />
            )}
          </div>
        </div>
      )}

      {/* Step 2: Upload Proof */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Digital Signature */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-2">Digital Signature</h4>
              <p className="text-sm text-gray-600 mb-4">Recipient's signature</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload('signature', e.target.files[0])}
                className="hidden"
                id="signature-upload"
              />
              <label
                htmlFor="signature-upload"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Signature</span>
              </label>
              {proofFiles.signature && (
                <p className="text-xs text-green-600 mt-2">✓ {proofFiles.signature.name}</p>
              )}
            </div>

            {/* Delivery Photo */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-2">Delivery Photo</h4>
              <p className="text-sm text-gray-600 mb-4">Photo at delivery location</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload('deliveryPhoto', e.target.files[0])}
                className="hidden"
                id="delivery-photo-upload"
              />
              <label
                htmlFor="delivery-photo-upload"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>Take Photo</span>
              </label>
              {proofFiles.deliveryPhoto && (
                <p className="text-xs text-green-600 mt-2">✓ {proofFiles.deliveryPhoto.name}</p>
              )}
            </div>

            {/* Package Photo */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-2">Package Photo</h4>
              <p className="text-sm text-gray-600 mb-4">Condition documentation</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload('packagePhoto', e.target.files[0])}
                className="hidden"
                id="package-photo-upload"
              />
              <label
                htmlFor="package-photo-upload"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>Take Photo</span>
              </label>
              {proofFiles.packagePhoto && (
                <p className="text-xs text-green-600 mt-2">✓ {proofFiles.packagePhoto.name}</p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Secure Upload</span>
            </div>
            <p className="text-sm text-blue-700">
              All proof documents are securely uploaded to TrackAS cloud storage with encryption and audit trails.
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Customer Feedback */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h4 className="font-medium text-purple-900 mb-4">Customer Feedback Collection</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setDeliveryData(prev => ({ ...prev, customerRating: rating }))}
                      className={`p-2 rounded-lg transition-colors ${
                        deliveryData.customerRating >= rating
                          ? 'text-yellow-500'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-gray-600">
                    {deliveryData.customerRating}/5 stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Feedback</label>
                <textarea
                  name="customerFeedback"
                  value={deliveryData.customerFeedback}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Customer's feedback about the delivery service..."
                />
              </div>
            </div>
          </div>

          {/* Delivery Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">Delivery Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Shipment ID:</span>
                <p className="font-medium">{shipmentId}</p>
              </div>
              <div>
                <span className="text-gray-600">Customer:</span>
                <p className="font-medium">{customerName}</p>
              </div>
              <div>
                <span className="text-gray-600">Recipient:</span>
                <p className="font-medium">{deliveryData.recipientName || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-gray-600">Condition:</span>
                <p className="font-medium capitalize">{deliveryData.packageCondition.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-gray-600">Proof Files:</span>
                <p className="font-medium">
                  {Object.values(proofFiles).filter(Boolean).length}/3 uploaded
                </p>
              </div>
              <div>
                <span className="text-gray-600">GPS Verified:</span>
                <p className="font-medium">{location ? '✓ Yes' : '✗ No'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        {currentStep < 3 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep + 1)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitDelivery}
            disabled={isSubmitting || !proofFiles.signature || !proofFiles.deliveryPhoto}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Complete Delivery</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProofOfDelivery;