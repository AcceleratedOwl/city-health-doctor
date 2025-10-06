import { AirQualityService } from './airQualityAPI';
import { EarthquakeService } from './earthquakeAPI';
import { WeatherService } from './weatherAPI';

export interface APITestResult {
  service: string;
  status: 'success' | 'error' | 'timeout';
  responseTime: number;
  dataReceived: boolean;
  errorMessage?: string;
  sampleData?: any;
}

export interface APITestSuite {
  results: APITestResult[];
  overallStatus: 'healthy' | 'degraded' | 'critical';
  timestamp: number;
}

export class APITester {
  private airQualityService: AirQualityService;
  private earthquakeService: EarthquakeService;
  private weatherService: WeatherService;

  constructor() {
    this.airQualityService = new AirQualityService();
    this.earthquakeService = new EarthquakeService();
    this.weatherService = new WeatherService();
  }

  /**
   * Test all APIs with sample coordinates
   */
  async runFullTestSuite(): Promise<APITestSuite> {
    const testCoordinates = [
      { lat: 34.0522, lon: -118.2437, name: 'Los Angeles' },
      { lat: 40.7128, lon: -74.0060, name: 'New York' },
      { lat: 51.5074, lon: -0.1278, name: 'London' }
    ];

    const results: APITestResult[] = [];

    // Test each API with each coordinate set
    for (const coord of testCoordinates) {
      console.log(`Testing APIs for ${coord.name} (${coord.lat}, ${coord.lon})`);
      
      // Test Air Quality API
      const airQualityResult = await this.testAirQualityAPI(coord.lat, coord.lon);
      results.push(airQualityResult);

      // Test Earthquake API
      const earthquakeResult = await this.testEarthquakeAPI(coord.lat, coord.lon);
      results.push(earthquakeResult);

      // Test Weather API
      const weatherResult = await this.testWeatherAPI(coord.lat, coord.lon);
      results.push(weatherResult);

      // Small delay between tests to avoid rate limiting
      await this.delay(1000);
    }

    const overallStatus = this.determineOverallStatus(results);

    return {
      results,
      overallStatus,
      timestamp: Date.now()
    };
  }

  /**
   * Test Air Quality API
   */
  private async testAirQualityAPI(lat: number, lon: number): Promise<APITestResult> {
    const startTime = Date.now();
    
    try {
      const data = await this.airQualityService.fetchData(lat, lon);
      const responseTime = Date.now() - startTime;
      
      return {
        service: 'OpenAQ Air Quality',
        status: 'success',
        responseTime,
        dataReceived: data && data.results && data.results.length > 0,
        sampleData: data.results?.slice(0, 2) // First 2 results for inspection
      };
    } catch (error) {
      return {
        service: 'OpenAQ Air Quality',
        status: 'error',
        responseTime: Date.now() - startTime,
        dataReceived: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test Earthquake API
   */
  private async testEarthquakeAPI(lat: number, lon: number): Promise<APITestResult> {
    const startTime = Date.now();
    
    try {
      const data = await this.earthquakeService.fetchData(lat, lon);
      const responseTime = Date.now() - startTime;
      
      return {
        service: 'USGS Earthquake',
        status: 'success',
        responseTime,
        dataReceived: data && data.features && data.features.length >= 0,
        sampleData: data.features?.slice(0, 2) // First 2 features for inspection
      };
    } catch (error) {
      return {
        service: 'USGS Earthquake',
        status: 'error',
        responseTime: Date.now() - startTime,
        dataReceived: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test Weather API
   */
  private async testWeatherAPI(lat: number, lon: number): Promise<APITestResult> {
    const startTime = Date.now();
    
    try {
      const data = await this.weatherService.fetchData(lat, lon);
      const responseTime = Date.now() - startTime;
      
      return {
        service: 'OpenWeatherMap',
        status: 'success',
        responseTime,
        dataReceived: data && data.main && data.main.temp !== undefined,
        sampleData: {
          temperature: data.main.temp,
          humidity: data.main.humidity,
          pressure: data.main.pressure
        }
      };
    } catch (error) {
      return {
        service: 'OpenWeatherMap',
        status: 'error',
        responseTime: Date.now() - startTime,
        dataReceived: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test individual API with specific coordinates
   */
  async testSingleAPI(service: 'airQuality' | 'earthquake' | 'weather', lat: number, lon: number): Promise<APITestResult> {
    switch (service) {
      case 'airQuality':
        return this.testAirQualityAPI(lat, lon);
      case 'earthquake':
        return this.testEarthquakeAPI(lat, lon);
      case 'weather':
        return this.testWeatherAPI(lat, lon);
      default:
        throw new Error(`Unknown service: ${service}`);
    }
  }

  /**
   * Determine overall API health status
   */
  private determineOverallStatus(results: APITestResult[]): 'healthy' | 'degraded' | 'critical' {
    const successCount = results.filter(r => r.status === 'success').length;
    const totalCount = results.length;
    const successRate = successCount / totalCount;

    if (successRate >= 0.8) return 'healthy';
    if (successRate >= 0.5) return 'degraded';
    return 'critical';
  }

  /**
   * Get API health summary
   */
  getHealthSummary(results: APITestResult[]): {
    totalAPIs: number;
    healthyAPIs: number;
    degradedAPIs: number;
    criticalAPIs: number;
    averageResponseTime: number;
  } {
    const totalAPIs = results.length;
    const healthyAPIs = results.filter(r => r.status === 'success').length;
    const degradedAPIs = results.filter(r => r.status === 'error' && r.responseTime < 10000).length;
    const criticalAPIs = results.filter(r => r.status === 'error' && r.responseTime >= 10000).length;
    
    const averageResponseTime = results
      .filter(r => r.status === 'success')
      .reduce((sum, r) => sum + r.responseTime, 0) / healthyAPIs || 0;

    return {
      totalAPIs,
      healthyAPIs,
      degradedAPIs,
      criticalAPIs,
      averageResponseTime: Math.round(averageResponseTime)
    };
  }

  /**
   * Validate API response data structure
   */
  validateAPIResponse(service: string, data: any): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    switch (service) {
      case 'OpenAQ Air Quality':
        if (!data.results) issues.push('Missing results array');
        if (!Array.isArray(data.results)) issues.push('Results is not an array');
        if (data.results && data.results.length > 0) {
          const firstResult = data.results[0];
          if (!firstResult.location) issues.push('Missing location in result');
          if (!firstResult.measurements) issues.push('Missing measurements in result');
        }
        break;

      case 'USGS Earthquake':
        if (!data.features) issues.push('Missing features array');
        if (!Array.isArray(data.features)) issues.push('Features is not an array');
        if (data.features && data.features.length > 0) {
          const firstFeature = data.features[0];
          if (!firstFeature.properties) issues.push('Missing properties in feature');
          if (!firstFeature.geometry) issues.push('Missing geometry in feature');
        }
        break;

      case 'OpenWeatherMap':
        if (!data.main) issues.push('Missing main object');
        if (data.main && typeof data.main.temp !== 'number') issues.push('Invalid temperature data');
        if (data.main && typeof data.main.humidity !== 'number') issues.push('Invalid humidity data');
        break;
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear all service caches
   */
  clearAllCaches(): void {
    this.airQualityService.clearCache();
    this.earthquakeService.clearCache();
    this.weatherService.clearCache();
  }

  /**
   * Get cache statistics for all services
   */
  getAllCacheStats(): {
    airQuality: { size: number; entries: string[] };
    earthquake: { size: number; entries: string[] };
    weather: { size: number; entries: string[] };
  } {
    return {
      airQuality: this.airQualityService.getCacheStats(),
      earthquake: this.earthquakeService.getCacheStats(),
      weather: this.weatherService.getCacheStats()
    };
  }
}
