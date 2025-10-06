import axios, { AxiosResponse } from 'axios';
import { OpenAQResponse, APIService, CacheEntry, APIError } from '../types';

export class AirQualityService implements APIService {
  private cache: Map<string, CacheEntry<OpenAQResponse>> = new Map();
  private lastError: string | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly BASE_URL = 'https://api.openaq.org/v1';

  /**
   * Fetch air quality data for a specific location
   */
  async fetchData(lat: number, lon: number): Promise<OpenAQResponse> {
    const cacheKey = `air_quality_${lat}_${lon}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    try {
      const response: AxiosResponse<OpenAQResponse> = await axios.get(
        `${this.BASE_URL}/latest`,
        {
          params: {
            coordinates: `${lat},${lon}`,
            radius: 10000, // 10km radius
            limit: 100
          },
          timeout: 10000
        }
      );

      const data = response.data;
      
      // Cache the response
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL
      });

      this.lastError = null;
      return data;
    } catch (error) {
      this.lastError = this.handleError(error);
      throw new Error(`Air quality API error: ${this.lastError}`);
    }
  }

  /**
   * Check if the service is healthy
   */
  isHealthy(): boolean {
    return this.lastError === null;
  }

  /**
   * Get the last error message
   */
  getLastError(): string | null {
    return this.lastError;
  }

  /**
   * Process raw API response into standardized format
   */
  processAirQualityData(response: OpenAQResponse): {
    aqi: number;
    pollutants: {
      no2: number;
      pm25: number;
      o3: number;
    };
    status: 'healthy' | 'unhealthy' | 'hazardous';
    trend: 'improving' | 'stable' | 'worsening';
  } {
    if (!response.results || response.results.length === 0) {
      return {
        aqi: 0,
        pollutants: { no2: 0, pm25: 0, o3: 0 },
        status: 'healthy',
        trend: 'stable'
      };
    }

    // Aggregate measurements from all nearby stations
    const measurements = response.results.flatMap(result => result.measurements);
    
    const pollutants = {
      no2: this.getAverageMeasurement(measurements, 'no2'),
      pm25: this.getAverageMeasurement(measurements, 'pm25'),
      o3: this.getAverageMeasurement(measurements, 'o3')
    };

    // Calculate AQI (simplified)
    const aqi = this.calculateAQI(pollutants);
    
    // Determine status
    const status = this.determineAirQualityStatus(aqi);
    
    // Determine trend (simplified - would need historical data for real trend)
    const trend = this.determineTrend(pollutants);

    return {
      aqi,
      pollutants,
      status,
      trend
    };
  }

  /**
   * Get average measurement for a specific parameter
   */
  private getAverageMeasurement(measurements: any[], parameter: string): number {
    const values = measurements
      .filter(m => m.parameter === parameter)
      .map(m => m.value)
      .filter(v => v !== null && v !== undefined);
    
    if (values.length === 0) return 0;
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate Air Quality Index (simplified)
   */
  private calculateAQI(pollutants: { no2: number; pm25: number; o3: number }): number {
    // Simplified AQI calculation based on PM2.5 (most common indicator)
    const pm25 = pollutants.pm25;
    
    if (pm25 <= 12) return Math.max(0, (pm25 / 12) * 50);
    if (pm25 <= 35.4) return 50 + ((pm25 - 12) / 23.4) * 50;
    if (pm25 <= 55.4) return 100 + ((pm25 - 35.4) / 20) * 50;
    if (pm25 <= 150.4) return 150 + ((pm25 - 55.4) / 95) * 100;
    if (pm25 <= 250.4) return 250 + ((pm25 - 150.4) / 100) * 100;
    return Math.min(500, 350 + ((pm25 - 250.4) / 149.6) * 150);
  }

  /**
   * Determine air quality status based on AQI
   */
  private determineAirQualityStatus(aqi: number): 'healthy' | 'unhealthy' | 'hazardous' {
    if (aqi <= 50) return 'healthy';
    if (aqi <= 150) return 'unhealthy';
    return 'hazardous';
  }

  /**
   * Determine trend (simplified - would need historical data)
   */
  private determineTrend(pollutants: { no2: number; pm25: number; o3: number }): 'improving' | 'stable' | 'worsening' {
    // This is a simplified implementation
    // In a real application, you'd compare with historical data
    const avgPollution = (pollutants.no2 + pollutants.pm25 + pollutants.o3) / 3;
    
    if (avgPollution < 10) return 'improving';
    if (avgPollution > 30) return 'worsening';
    return 'stable';
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): string {
    if (error.response) {
      return `HTTP ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`;
    } else if (error.request) {
      return 'Network error: Unable to reach air quality service';
    } else {
      return `Request error: ${error.message}`;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}
