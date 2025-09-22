import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  TrendingDown, 
  MapPin, 
  Clock, 
  DollarSign,
  Truck,
  User,
  Navigation,
  Zap,
  Eye,
  CheckCircle,
  XCircle,
  Brain,
  Target,
  BarChart3
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { useApp } from '../context/AppContext';
import { useDatabase } from '../context/DatabaseContext';

const AnomalyDetection: React.FC = () => {
  const { state } = useApp();
  const { shipments, operators } = useDatabase();
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [timeWindow, setTimeWindow] = useState<'1h' | '24h' | '7d'>('24h');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  useEffect(() => {
    detectAnomalies();
    
    // Run anomaly detection every 5 minutes
    const interval = setInterval(detectAnomalies, 300000);
    return () => clearInterval(interval);
  }, [timeWindow]);

  const detectAnomalies = async () => {
    setIsScanning(true);
    
    try {
      const detectedAnomalies = await aiService.detectAnomalies(
        shipments || state.shipments,
        operators || state.operators,
        timeWindow
      );
      setAnomalies(detectedAnomalies);
    } catch (error) {
      console.error('Failed to detect anomalies:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const filteredAnomalies = anomalies.filter(anomaly => 
    filterSeverity === 'all' || anomaly.severity === filterSeverity
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return AlertTriangle;
      case 'medium': return Clock;
      case 'low': return Eye;
      default: return Shield;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'delivery_delay': return Clock;
      case 'route_deviation': return Navigation;
      case 'cost_spike': return DollarSign;
      case 'performance_drop': return TrendingDown;
      case 'location_anomaly': return MapPin;
      default: return AlertTriangle;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'delivery_delay': return 'Delivery Delay';
      case 'route_deviation': return 'Route Deviation';
      case 'cost_spike': return 'Cost Spike';
      case 'performance_drop': return 'Performance Drop';
      case 'location_anomaly': return 'Location Anomaly';
      default: return 'Unknown';
    }
  };

  const handleResolveAnomaly = (anomalyId: string) => {
    setAnomalies(prev => prev.filter(a => a.id !== anomalyId));
    // In real app, this would mark the anomaly as resolved in the database
  };

  const selectedAnomalyData = selectedAnomaly ? 
    filteredAnomalies.find(a => a.id === selectedAnomaly) : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Anomaly Detection</h2>
            <p className="text-gray-600">Real-time detection of unusual patterns and potential issues</p>
          </div>
          <div className="flex items-center space-x-4">
            {isScanning && (
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-700 font-medium">Scanning...</span>
              </div>
            )}
            <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-red-700 font-medium">
                {filteredAnomalies.filter(a => a.severity === 'high').length} Critical Issues
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Anomalies</p>
              <p className="text-2xl font-bold text-gray-900">{filteredAnomalies.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <Brain className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Severity</p>
              <p className="text-2xl font-bold text-red-600">
                {filteredAnomalies.filter(a => a.severity === 'high').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Medium Severity</p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredAnomalies.filter(a => a.severity === 'medium').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredAnomalies.length > 0 
                  ? Math.round(filteredAnomalies.reduce((sum, a) => sum + a.confidence, 0) / filteredAnomalies.length)
                  : 0}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Window</label>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity Filter</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={detectAnomalies}
              disabled={isScanning}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {isScanning ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Shield className="h-4 w-4" />
              )}
              <span>Scan for Anomalies</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Anomalies List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Detected Anomalies ({filteredAnomalies.length})
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredAnomalies.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Anomalies Detected</h4>
                  <p className="text-gray-600">All systems operating normally</p>
                </div>
              ) : (
                filteredAnomalies.map((anomaly) => {
                  const SeverityIcon = getSeverityIcon(anomaly.severity);
                  const TypeIcon = getTypeIcon(anomaly.type);
                  const isSelected = selectedAnomaly === anomaly.id;
                  
                  return (
                    <div
                      key={anomaly.id}
                      onClick={() => setSelectedAnomaly(anomaly.id)}
                      className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-red-50 border-r-4 border-red-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getSeverityColor(anomaly.severity).replace('text-', 'bg-').replace('bg-', 'bg-').replace('-600', '-100')}`}>
                            <TypeIcon className={`h-5 w-5 ${getSeverityColor(anomaly.severity).split(' ')[0]}`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{getTypeLabel(anomaly.type)}</h4>
                            <p className="text-sm text-gray-600">{anomaly.id}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(anomaly.severity)}`}>
                            <SeverityIcon className="h-3 w-3 mr-1" />
                            {anomaly.severity.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {anomaly.confidence}% Confidence
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{anomaly.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Affected: {anomaly.affectedShipments.length} shipments</span>
                        <span>{new Date(anomaly.detectedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Anomaly Details */}
        <div>
          {selectedAnomalyData ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Anomaly Details</h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(selectedAnomalyData.severity)}`}>
                  {selectedAnomalyData.severity.toUpperCase()}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Anomaly ID</label>
                  <p className="text-gray-900 font-mono">{selectedAnomalyData.id}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <p className="text-gray-900">{getTypeLabel(selectedAnomalyData.type)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <div className="bg-gray-50 rounded-lg p-3 mt-1">
                    <p className="text-sm text-gray-900">{selectedAnomalyData.description}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">AI Confidence</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${selectedAnomalyData.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{selectedAnomalyData.confidence}%</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Affected Shipments</label>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-1">
                    <div className="space-y-1">
                      {selectedAnomalyData.affectedShipments.map((shipmentId: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Package className="h-3 w-3 text-yellow-600" />
                          <span className="text-sm text-yellow-800 font-mono">{shipmentId}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">AI Recommendation</label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-1">
                    <div className="flex items-start space-x-2">
                      <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-800">{selectedAnomalyData.recommendation}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Detection Time</label>
                  <p className="text-gray-900">{new Date(selectedAnomalyData.detectedAt).toLocaleString()}</p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleResolveAnomaly(selectedAnomalyData.id)}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Mark as Resolved</span>
                  </button>
                  
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>Investigate Further</span>
                  </button>

                  <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Create Alert</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-center text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select an anomaly to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Analysis Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-900">AI Analysis Summary</h3>
            <p className="text-sm text-purple-700">System-wide pattern analysis and recommendations</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-800">System Health</span>
            </div>
            <p className="text-xs text-gray-600">
              {filteredAnomalies.length === 0 ? 'Excellent' : 
               filteredAnomalies.filter(a => a.severity === 'high').length === 0 ? 'Good' : 'Needs Attention'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-800">Risk Level</span>
            </div>
            <p className="text-xs text-gray-600">
              {filteredAnomalies.filter(a => a.severity === 'high').length > 2 ? 'High' : 
               filteredAnomalies.length > 5 ? 'Medium' : 'Low'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-800">Detection Accuracy</span>
            </div>
            <p className="text-xs text-gray-600">96.8% (Last 30 days)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetection;