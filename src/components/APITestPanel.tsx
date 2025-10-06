import React, { useState, useEffect } from 'react';
import { APITester, APITestResult, APITestSuite } from '../services/apiTester';
import { CacheManager } from '../services/cacheManager';

interface APITestPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const APITestPanel: React.FC<APITestPanelProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<APITestSuite | null>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState('Los Angeles');
  
  const apiTester = new APITester();
  const cacheManager = new CacheManager();

  const testLocations = [
    { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
    { name: 'New York', lat: 40.7128, lon: -74.0060 },
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    { name: 'Paris', lat: 48.8566, lon: 2.3522 }
  ];

  const runTests = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      const testResults = await apiTester.runFullTestSuite();
      setResults(testResults);
      
      // Update cache stats
      const stats = cacheManager.getStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('API testing failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runSingleTest = async (service: 'airQuality' | 'earthquake' | 'weather') => {
    setIsRunning(true);
    
    try {
      const location = testLocations.find(loc => loc.name === selectedLocation);
      if (!location) return;

      const result = await apiTester.testSingleAPI(service, location.lat, location.lon);
      
      // Update results with single test
      if (results) {
        const updatedResults = {
          ...results,
          results: [...results.results, result]
        };
        setResults(updatedResults);
      }
    } catch (error) {
      console.error('Single API test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const clearCache = () => {
    apiTester.clearAllCaches();
    cacheManager.clear();
    setCacheStats(cacheManager.getStats());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'timeout':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-lg">🔧</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">API Testing Suite</h2>
              <p className="text-sm text-gray-600">Test and validate all API endpoints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? 'Running Tests...' : 'Run Full Test Suite'}
            </button>
            
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {testLocations.map(location => (
                <option key={location.name} value={location.name}>
                  {location.name}
                </option>
              ))}
            </select>

            <div className="flex space-x-2">
              <button
                onClick={() => runSingleTest('airQuality')}
                disabled={isRunning}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm transition-colors"
              >
                Test Air Quality
              </button>
              <button
                onClick={() => runSingleTest('earthquake')}
                disabled={isRunning}
                className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm transition-colors"
              >
                Test Earthquakes
              </button>
              <button
                onClick={() => runSingleTest('weather')}
                disabled={isRunning}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm transition-colors"
              >
                Test Weather
              </button>
            </div>

            <button
              onClick={clearCache}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Cache
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="p-6">
          {results && (
            <div className="space-y-6">
              {/* Overall Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Overall Status</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOverallStatusColor(results.overallStatus)}`}>
                    {results.overallStatus.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Total Tests</div>
                    <div className="font-semibold">{results.results.length}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Successful</div>
                    <div className="font-semibold text-green-600">
                      {results.results.filter(r => r.status === 'success').length}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Failed</div>
                    <div className="font-semibold text-red-600">
                      {results.results.filter(r => r.status === 'error').length}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Avg Response Time</div>
                    <div className="font-semibold">
                      {Math.round(results.results.reduce((sum, r) => sum + r.responseTime, 0) / results.results.length)}ms
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Results */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
                <div className="space-y-3">
                  {results.results.map((result, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-700">{result.service}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                            {result.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {result.responseTime}ms
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        Data Received: {result.dataReceived ? 'Yes' : 'No'}
                      </div>
                      
                      {result.errorMessage && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                          Error: {result.errorMessage}
                        </div>
                      )}
                      
                      {result.sampleData && (
                        <details className="mt-2">
                          <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                            View Sample Data
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(result.sampleData, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cache Statistics */}
          {cacheStats && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Cache Size</div>
                  <div className="font-semibold">{cacheStats.size} entries</div>
                </div>
                <div>
                  <div className="text-gray-600">Hit Rate</div>
                  <div className="font-semibold">{(cacheStats.hitRate * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-gray-600">Total Requests</div>
                  <div className="font-semibold">{cacheStats.totalRequests}</div>
                </div>
                <div>
                  <div className="text-gray-600">Avg Response Time</div>
                  <div className="font-semibold">{cacheStats.averageResponseTime}ms</div>
                </div>
              </div>
            </div>
          )}

          {!results && !isRunning && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">🔧</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Test APIs</h3>
              <p className="text-gray-600">Click "Run Full Test Suite" to test all API endpoints</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default APITestPanel;
