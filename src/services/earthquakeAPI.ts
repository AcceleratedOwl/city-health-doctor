import axios, { AxiosResponse } from 'axios';
import { USGSEarthquakeResponse, APIService, CacheEntry } from '../types';

export class EarthquakeService implements APIService {
  private cache: Map<string, CacheEntry<USGSEarthquakeResponse>> = new Map();
  private lastError: string | null = null;
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly BASE_URL = 'https://earthquake.usgs.gov/fdsnws/event/1';

  /**
   * Fetch earthquake data for a specific location
   */
  async fetchData(lat: number, lon: number): Promise<USGSEarthquakeResponse> {
    const cacheKey = `earthquakes_${lat}_${lon}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    try {
      // Calculate bounding box (roughly 100km radius)
      const radius = 1; // degrees (roughly 100km)
      const minLat = lat - radius;
      const maxLat = lat + radius;
      const minLon = lon - radius;
      const maxLon = lon + radius;

      const response: AxiosResponse<USGSEarthquakeResponse> = await axios.get(
        `${this.BASE_URL}/query`,
        {
          params: {
            format: 'geojson',
            starttime: this.getStartTime(),
            endtime: new Date().toISOString(),
            minlatitude: minLat,
            maxlatitude: maxLat,
            minlongitude: minLon,
            maxlongitude: maxLon,
            minmagnitude: 2.5, // Only significant earthquakes
            limit: 50
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
      throw new Error(`Earthquake API error: ${this.lastError}`);
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
   * Process earthquake data into disaster metrics
   */
  processEarthquakeData(response: USGSEarthquakeResponse): {
    disasterEvents: number;
    pollutionHotspots: number;
    status: 'clean' | 'infected' | 'critical';
    description: string;
  } {
    if (!response.features || response.features.length === 0) {
      return {
        disasterEvents: 0,
        pollutionHotspots: 0,
        status: 'clean',
        description: 'No recent natural disasters detected in the area.'
      };
    }

    const recentEarthquakes = response.features.filter(earthquake => {
      const eventTime = new Date(earthquake.properties.time);
      const daysAgo = (Date.now() - eventTime.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30; // Last 30 days
    });

    const disasterEvents = recentEarthquakes.length;
    const pollutionHotspots = 0; // Earthquakes don't directly create pollution hotspots

    let status: 'clean' | 'infected' | 'critical';
    let description: string;

    if (disasterEvents === 0) {
      status = 'clean';
      description = 'No recent natural disasters detected in the area.';
    } else if (disasterEvents <= 2) {
      status = 'infected';
      description = `Low disaster activity: ${disasterEvents} earthquake(s) in the last 30 days.`;
    } else {
      status = 'critical';
      description = `High disaster activity: ${disasterEvents} earthquake(s) in the last 30 days.`;
    }

    return {
      disasterEvents,
      pollutionHotspots,
      status,
      description
    };
  }

  /**
   * Get start time for earthquake queries (last 30 days)
   */
  private getStartTime(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString();
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): string {
    if (error.response) {
      return `HTTP ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`;
    } else if (error.request) {
      return 'Network error: Unable to reach earthquake service';
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
