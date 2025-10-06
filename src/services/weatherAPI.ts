import axios, { AxiosResponse } from 'axios';
import { WeatherResponse, APIService, CacheEntry } from '../types';

export class WeatherService implements APIService {
  private cache: Map<string, CacheEntry<WeatherResponse>> = new Map();
  private lastError: string | null = null;
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';
  private readonly API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || '';

  /**
   * Fetch weather data for a specific location
   */
  async fetchData(lat: number, lon: number): Promise<WeatherResponse> {
    const cacheKey = `weather_${lat}_${lon}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    if (!this.API_KEY) {
      throw new Error('OpenWeatherMap API key not configured');
    }

    try {
      const response: AxiosResponse<WeatherResponse> = await axios.get(
        `${this.BASE_URL}/weather`,
        {
          params: {
            lat,
            lon,
            appid: this.API_KEY,
            units: 'metric'
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
      throw new Error(`Weather API error: ${this.lastError}`);
    }
  }

  /**
   * Check if the service is healthy
   */
  isHealthy(): boolean {
    return this.lastError === null && this.API_KEY !== '';
  }

  /**
   * Get the last error message
   */
  getLastError(): string | null {
    return this.lastError;
  }

  /**
   * Process weather data into temperature metrics
   */
  processWeatherData(response: WeatherResponse): {
    temperature: number;
    heatIslandEffect: number;
    status: 'normal' | 'fever' | 'critical';
    trend: 'increasing' | 'stable' | 'decreasing';
    description: string;
  } {
    const temperature = response.main.temp;
    
    // Estimate heat island effect (simplified)
    // In a real application, you'd compare with surrounding rural areas
    const heatIslandEffect = this.estimateHeatIslandEffect(temperature);
    
    // Determine temperature status
    const status = this.determineTemperatureStatus(temperature);
    
    // Determine trend (simplified - would need historical data)
    const trend = this.determineTemperatureTrend(temperature);
    
    // Generate description
    const description = this.generateTemperatureDescription(temperature, heatIslandEffect, status);

    return {
      temperature,
      heatIslandEffect,
      status,
      trend,
      description
    };
  }

  /**
   * Estimate heat island effect (simplified)
   */
  private estimateHeatIslandEffect(temperature: number): number {
    // Simplified heat island effect calculation
    // In reality, you'd compare with surrounding rural temperatures
    if (temperature > 35) return 5.0;
    if (temperature > 30) return 3.0;
    if (temperature > 25) return 1.5;
    if (temperature > 20) return 0.5;
    return 0;
  }

  /**
   * Determine temperature status
   */
  private determineTemperatureStatus(temperature: number): 'normal' | 'fever' | 'critical' {
    if (temperature > 40) return 'critical';
    if (temperature > 35) return 'fever';
    return 'normal';
  }

  /**
   * Determine temperature trend (simplified)
   */
  private determineTemperatureTrend(temperature: number): 'increasing' | 'stable' | 'decreasing' {
    // This is a simplified implementation
    // In a real application, you'd compare with historical data
    if (temperature > 30) return 'increasing';
    if (temperature < 15) return 'decreasing';
    return 'stable';
  }

  /**
   * Generate temperature description
   */
  private generateTemperatureDescription(
    temperature: number, 
    heatIslandEffect: number, 
    status: string
  ): string {
    let description = `Current temperature: ${temperature.toFixed(1)}°C`;
    
    if (heatIslandEffect > 3) {
      description += `. Strong urban heat island effect detected (+${heatIslandEffect.toFixed(1)}°C above surrounding areas).`;
    } else if (heatIslandEffect > 1) {
      description += `. Moderate heat island effect (+${heatIslandEffect.toFixed(1)}°C).`;
    } else {
      description += `. Minimal heat island effect.`;
    }
    
    if (status === 'critical') {
      description += ' CRITICAL: Extreme heat conditions require immediate attention.';
    } else if (status === 'fever') {
      description += ' Elevated temperatures detected - heat management needed.';
    }
    
    return description;
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): string {
    if (error.response) {
      if (error.response.status === 401) {
        return 'Invalid API key for OpenWeatherMap';
      }
      return `HTTP ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`;
    } else if (error.request) {
      return 'Network error: Unable to reach weather service';
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
