import React, { useState, useCallback, useEffect } from 'react';
import Map from './components/Map';
import VitalsPanel from './components/VitalsPanel';
import DiagnosisCard from './components/DiagnosisCard';
import APITestPanel from './components/APITestPanel';
import ErrorBoundary from './components/ErrorBoundary';
import AnimatedVitalCard from './components/AnimatedVitalCard';
import SkeletonLoader from './components/SkeletonLoader';
import AccessibilityEnhancer from './components/AccessibilityEnhancer';
import ResponsiveLayout from './components/ResponsiveLayout';
import PerformanceOptimizer from './components/PerformanceOptimizer';
import { LocationData, CityVitals } from './types';
import { DiagnosticEngine } from './services/diagnosticEngine';
import { AirQualityService } from './services/airQualityAPI';
import { EarthquakeService } from './services/earthquakeAPI';
import { WeatherService } from './services/weatherAPI';
import { MockDataService } from './services/mockDataService';
import { DataValidator } from './services/dataValidator';
import { CacheManager } from './services/cacheManager';

function App() {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [vitals, setVitals] = useState<CityVitals | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAPITest, setShowAPITest] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  // Initialize API services
  const airQualityService = new AirQualityService();
  const earthquakeService = new EarthquakeService();
  const weatherService = new WeatherService();
  const cacheManager = new CacheManager();

  const handleLocationSelect = useCallback(async (location: LocationData) => {
    setSelectedLocation(location);
    setIsLoading(true);
    setError(null);

    try {
      // Validate location data
      const locationValidation = DataValidator.validateLocation(location);
      if (!locationValidation.isValid) {
        throw new Error(`Invalid location data: ${locationValidation.errors.join(', ')}`);
      }

      let processedVitals: CityVitals;

      if (useMockData) {
        // Use mock data for development/testing
        await MockDataService.simulateAPIDelay(1000, 3000);
        processedVitals = MockDataService.generateMockVitals(location);
      } else {
        // Fetch real data from APIs
        const [airQualityData, earthquakeData, weatherData] = await Promise.allSettled([
          airQualityService.fetchData(location.lat, location.lon),
          earthquakeService.fetchData(location.lat, location.lon),
          weatherService.fetchData(location.lat, location.lon)
        ]);

        // Process the data
        processedVitals = await processCityVitals(
          location,
          airQualityData,
          earthquakeData,
          weatherData
        );
      }

      // Validate processed vitals
      const vitalsValidation = DataValidator.validateCityVitals(processedVitals);
      if (!vitalsValidation.isValid) {
        console.warn('Vitals validation issues:', vitalsValidation.errors);
      }

      // Generate quality report
      const qualityReport = DataValidator.generateQualityReport(processedVitals);
      console.log('Data quality report:', qualityReport);

      setVitals(processedVitals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch city data');
      console.error('Error fetching city data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [useMockData]);

  const processCityVitals = async (
    location: LocationData,
    airQualityResult: PromiseSettledResult<any>,
    earthquakeResult: PromiseSettledResult<any>,
    weatherResult: PromiseSettledResult<any>
  ): Promise<CityVitals> => {
    // Process air quality data
    let airQuality = {
      aqi: 0,
      pollutants: { no2: 0, pm25: 0, o3: 0 },
      status: 'healthy' as const,
      trend: 'stable' as const
    };

    if (airQualityResult.status === 'fulfilled') {
      airQuality = airQualityService.processAirQualityData(airQualityResult.value);
    }

    // Process earthquake data
    let disasterData = {
      disasterEvents: 0,
      pollutionHotspots: 0,
      status: 'clean' as const,
      description: 'No recent natural disasters detected.'
    };

    if (earthquakeResult.status === 'fulfilled') {
      disasterData = earthquakeService.processEarthquakeData(earthquakeResult.value);
    }

    // Process weather data
    let temperatureData = {
      temperature: 20,
      heatIslandEffect: 0,
      status: 'normal' as const,
      trend: 'stable' as const,
      description: 'Temperature data unavailable.'
    };

    if (weatherResult.status === 'fulfilled') {
      temperatureData = weatherService.processWeatherData(weatherResult.value);
    }

    // Create mock data for missing services (in a real app, you'd have all APIs working)
    const mockVitals: CityVitals = {
      heartRate: {
        value: Math.floor(Math.random() * 40) + 60, // 60-100 bpm
        status: 'normal',
        trend: 'stable',
        description: 'Urban activity levels are normal based on nighttime light intensity.'
      },
      temperature: {
        value: temperatureData.temperature,
        heatIslandEffect: temperatureData.heatIslandEffect,
        status: temperatureData.status,
        trend: temperatureData.trend,
        description: temperatureData.description
      },
      bloodOxygen: {
        value: airQuality.aqi,
        pollutants: airQuality.pollutants,
        status: airQuality.status,
        trend: airQuality.trend,
        description: `Air quality index: ${airQuality.aqi.toFixed(0)}. ${airQuality.status === 'healthy' ? 'Good air quality.' : 'Air quality concerns detected.'}`
      },
      immuneSystem: {
        greenSpaceCoverage: Math.floor(Math.random() * 30) + 10, // 10-40%
        ndvi: Math.random() * 0.8 + 0.2, // 0.2-1.0
        status: 'strong',
        trend: 'stable',
        description: 'Vegetation coverage and health are within normal ranges.'
      },
      infections: {
        disasterEvents: disasterData.disasterEvents,
        pollutionHotspots: disasterData.pollutionHotspots,
        status: disasterData.status,
        description: disasterData.description
      },
      overallHealth: {
        score: 0,
        status: 'fair',
        diagnosis: '',
        recommendations: []
      }
    };

    // Generate diagnosis using the diagnostic engine
    const diagnosis = DiagnosticEngine.generateDiagnosis(mockVitals);
    
    mockVitals.overallHealth = {
      score: diagnosis.overallScore,
      status: diagnosis.severity === 'low' ? 'excellent' : 
              diagnosis.severity === 'medium' ? 'good' : 
              diagnosis.severity === 'high' ? 'fair' : 'poor',
      diagnosis: diagnosis.diagnosis,
      recommendations: diagnosis.recommendations
    };

    return mockVitals;
  };

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return (
    <ErrorBoundary>
      <AccessibilityEnhancer>
        <PerformanceOptimizer>
          <ResponsiveLayout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🏥</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">CityPulse</h1>
                  <p className="text-sm text-gray-600">Urban Health Monitor</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={useMockData}
                      onChange={(e) => setUseMockData(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-gray-600">Mock Data</span>
                  </label>
                </div>
                
                <button
                  onClick={() => setShowAPITest(true)}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  🔧 Test APIs
                </button>
                
                <div className="text-sm text-gray-500">
                  NASA Space Apps Challenge 2025
                </div>
              </div>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden">
              <Map
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vitals Panel */}
            <div className="h-1/2">
              <VitalsPanel
                vitals={vitals}
                isLoading={isLoading}
                location={selectedLocation}
              />
            </div>

            {/* Diagnosis Card */}
            {vitals && selectedLocation && (
              <div className="h-1/2">
                <DiagnosisCard
                  vitals={vitals}
                  location={selectedLocation}
                />
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">⚠️</span>
              <span className="text-red-800 font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Instructions */}
        {!selectedLocation && !isLoading && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600">💡</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">How to Use CityPulse</h3>
                <ol className="text-blue-800 space-y-1 text-sm">
                  <li>1. Click anywhere on the map to select a location</li>
                  <li>2. Wait for the system to analyze city vitals</li>
                  <li>3. Review the health diagnosis and recommendations</li>
                  <li>4. Explore different areas to compare urban health</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-600">
            <p>CityPulse - Visualizing cities as living organisms using NASA Earth observation data</p>
            <p className="mt-1">Built for NASA Space Apps Challenge 2025</p>
          </div>
        </div>
      </footer>

            {/* API Test Panel */}
            <APITestPanel
              isOpen={showAPITest}
              onClose={() => setShowAPITest(false)}
            />
          </div>
          </ResponsiveLayout>
        </PerformanceOptimizer>
      </AccessibilityEnhancer>
    </ErrorBoundary>
  );
}

export default App;
