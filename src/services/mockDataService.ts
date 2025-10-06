import { CityVitals, LocationData } from '../types';

export class MockDataService {
  private static readonly MOCK_LOCATIONS = {
    'Los Angeles': {
      lat: 34.0522,
      lon: -118.2437,
      city: 'Los Angeles',
      country: 'USA'
    },
    'New York': {
      lat: 40.7128,
      lon: -74.0060,
      city: 'New York',
      country: 'USA'
    },
    'London': {
      lat: 51.5074,
      lon: -0.1278,
      city: 'London',
      country: 'UK'
    },
    'Tokyo': {
      lat: 35.6762,
      lon: 139.6503,
      city: 'Tokyo',
      country: 'Japan'
    },
    'Paris': {
      lat: 48.8566,
      lon: 2.3522,
      city: 'Paris',
      country: 'France'
    }
  };

  /**
   * Generate mock city vitals for a location
   */
  static generateMockVitals(location: LocationData): CityVitals {
    const cityName = this.getCityName(location);
    const baseVitals = this.getBaseVitalsForCity(cityName);
    
    // Add some randomness to make it feel realistic
    const randomFactor = Math.random() * 0.3 - 0.15; // -15% to +15%
    
    return {
      heartRate: {
        value: Math.round(baseVitals.heartRate * (1 + randomFactor)),
        status: this.determineStatus(baseVitals.heartRate * (1 + randomFactor), [60, 80, 100]),
        trend: this.getRandomTrend(),
        description: this.generateHeartRateDescription(baseVitals.heartRate * (1 + randomFactor))
      },
      temperature: {
        value: Math.round((baseVitals.temperature + randomFactor * 5) * 10) / 10,
        heatIslandEffect: Math.round((baseVitals.heatIslandEffect + randomFactor * 2) * 10) / 10,
        status: this.determineTemperatureStatus(baseVitals.temperature + randomFactor * 5),
        trend: this.getRandomTrend(),
        description: this.generateTemperatureDescription(baseVitals.temperature + randomFactor * 5, baseVitals.heatIslandEffect + randomFactor * 2)
      },
      bloodOxygen: {
        value: Math.round(baseVitals.airQuality * (1 + randomFactor)),
        pollutants: {
          no2: Math.round(baseVitals.pollutants.no2 * (1 + randomFactor * 0.5)),
          pm25: Math.round(baseVitals.pollutants.pm25 * (1 + randomFactor * 0.5)),
          o3: Math.round(baseVitals.pollutants.o3 * (1 + randomFactor * 0.5))
        },
        status: this.determineAirQualityStatus(baseVitals.airQuality * (1 + randomFactor)),
        trend: this.getRandomTrend(),
        description: this.generateAirQualityDescription(baseVitals.airQuality * (1 + randomFactor))
      },
      immuneSystem: {
        greenSpaceCoverage: Math.round(baseVitals.greenSpace * (1 + randomFactor)),
        ndvi: Math.round((baseVitals.ndvi + randomFactor * 0.2) * 100) / 100,
        status: this.determineGreenSpaceStatus(baseVitals.greenSpace * (1 + randomFactor)),
        trend: this.getRandomTrend(),
        description: this.generateGreenSpaceDescription(baseVitals.greenSpace * (1 + randomFactor))
      },
      infections: {
        disasterEvents: Math.max(0, Math.round(baseVitals.disasters + randomFactor * 2)),
        pollutionHotspots: Math.max(0, Math.round(baseVitals.pollutionHotspots + randomFactor * 1)),
        status: this.determineInfectionStatus(baseVitals.disasters + randomFactor * 2, baseVitals.pollutionHotspots + randomFactor * 1),
        description: this.generateInfectionDescription(baseVitals.disasters + randomFactor * 2, baseVitals.pollutionHotspots + randomFactor * 1)
      },
      overallHealth: {
        score: 0, // Will be calculated by diagnostic engine
        status: 'fair',
        diagnosis: '',
        recommendations: []
      }
    };
  }

  /**
   * Get base vitals for a specific city
   */
  private static getBaseVitalsForCity(cityName: string): {
    heartRate: number;
    temperature: number;
    heatIslandEffect: number;
    airQuality: number;
    pollutants: { no2: number; pm25: number; o3: number };
    greenSpace: number;
    ndvi: number;
    disasters: number;
    pollutionHotspots: number;
  } {
    const cityData = {
      'Los Angeles': {
        heartRate: 75,
        temperature: 22,
        heatIslandEffect: 3.5,
        airQuality: 45,
        pollutants: { no2: 25, pm25: 15, o3: 35 },
        greenSpace: 25,
        ndvi: 0.6,
        disasters: 1,
        pollutionHotspots: 3
      },
      'New York': {
        heartRate: 85,
        temperature: 18,
        heatIslandEffect: 4.2,
        airQuality: 55,
        pollutants: { no2: 35, pm25: 20, o3: 40 },
        greenSpace: 20,
        ndvi: 0.5,
        disasters: 0,
        pollutionHotspots: 5
      },
      'London': {
        heartRate: 70,
        temperature: 15,
        heatIslandEffect: 2.8,
        airQuality: 35,
        pollutants: { no2: 20, pm25: 12, o3: 25 },
        greenSpace: 35,
        ndvi: 0.7,
        disasters: 0,
        pollutionHotspots: 2
      },
      'Tokyo': {
        heartRate: 90,
        temperature: 20,
        heatIslandEffect: 5.1,
        airQuality: 65,
        pollutants: { no2: 45, pm25: 25, o3: 50 },
        greenSpace: 15,
        ndvi: 0.4,
        disasters: 2,
        pollutionHotspots: 4
      },
      'Paris': {
        heartRate: 65,
        temperature: 16,
        heatIslandEffect: 2.5,
        airQuality: 30,
        pollutants: { no2: 15, pm25: 10, o3: 20 },
        greenSpace: 40,
        ndvi: 0.8,
        disasters: 0,
        pollutionHotspots: 1
      }
    };

    return cityData[cityName] || cityData['Los Angeles'];
  }

  /**
   * Get city name from coordinates
   */
  private static getCityName(location: LocationData): string {
    // Check if coordinates match known cities
    for (const [cityName, cityData] of Object.entries(this.MOCK_LOCATIONS)) {
      const latDiff = Math.abs(location.lat - cityData.lat);
      const lonDiff = Math.abs(location.lon - cityData.lon);
      
      if (latDiff < 0.1 && lonDiff < 0.1) {
        return cityName;
      }
    }
    
    return 'Los Angeles'; // Default fallback
  }

  /**
   * Determine status based on value and thresholds
   */
  private static determineStatus(value: number, thresholds: [number, number, number]): string {
    if (value <= thresholds[0]) return 'normal';
    if (value <= thresholds[1]) return 'elevated';
    return 'critical';
  }

  /**
   * Determine temperature status
   */
  private static determineTemperatureStatus(temperature: number): 'normal' | 'fever' | 'critical' {
    if (temperature > 35) return 'critical';
    if (temperature > 30) return 'fever';
    return 'normal';
  }

  /**
   * Determine air quality status
   */
  private static determineAirQualityStatus(aqi: number): 'healthy' | 'unhealthy' | 'hazardous' {
    if (aqi <= 50) return 'healthy';
    if (aqi <= 150) return 'unhealthy';
    return 'hazardous';
  }

  /**
   * Determine green space status
   */
  private static determineGreenSpaceStatus(coverage: number): 'strong' | 'weak' | 'compromised' {
    if (coverage >= 30) return 'strong';
    if (coverage >= 15) return 'weak';
    return 'compromised';
  }

  /**
   * Determine infection status
   */
  private static determineInfectionStatus(disasters: number, pollution: number): 'clean' | 'infected' | 'critical' {
    const total = disasters + pollution;
    if (total === 0) return 'clean';
    if (total <= 3) return 'infected';
    return 'critical';
  }

  /**
   * Get random trend
   */
  private static getRandomTrend(): 'increasing' | 'stable' | 'decreasing' {
    const trends = ['increasing', 'stable', 'decreasing'];
    return trends[Math.floor(Math.random() * trends.length)] as any;
  }

  /**
   * Generate heart rate description
   */
  private static generateHeartRateDescription(value: number): string {
    if (value > 90) return `High urban activity detected (${value.toFixed(0)} bpm). The city's heartbeat is elevated, indicating intense urban activity.`;
    if (value > 70) return `Normal urban activity levels (${value.toFixed(0)} bpm). The city's heartbeat is steady and healthy.`;
    return `Low urban activity detected (${value.toFixed(0)} bpm). The city's heartbeat is calm and relaxed.`;
  }

  /**
   * Generate temperature description
   */
  private static generateTemperatureDescription(temp: number, heatIsland: number): string {
    let description = `Current temperature: ${temp.toFixed(1)}°C`;
    
    if (heatIsland > 4) {
      description += `. Strong urban heat island effect detected (+${heatIsland.toFixed(1)}°C above surrounding areas).`;
    } else if (heatIsland > 2) {
      description += `. Moderate heat island effect (+${heatIsland.toFixed(1)}°C).`;
    } else {
      description += `. Minimal heat island effect.`;
    }
    
    return description;
  }

  /**
   * Generate air quality description
   */
  private static generateAirQualityDescription(aqi: number): string {
    if (aqi <= 50) return `Excellent air quality (AQI: ${aqi.toFixed(0)}). The city's air is clean and healthy.`;
    if (aqi <= 100) return `Good air quality (AQI: ${aqi.toFixed(0)}). Minor air quality concerns.`;
    if (aqi <= 150) return `Moderate air quality (AQI: ${aqi.toFixed(0)}). Sensitive groups should take precautions.`;
    return `Poor air quality (AQI: ${aqi.toFixed(0)}). Air quality is unhealthy for all residents.`;
  }

  /**
   * Generate green space description
   */
  private static generateGreenSpaceDescription(coverage: number): string {
    if (coverage >= 30) return `Excellent green space coverage (${coverage.toFixed(0)}%). The city has a strong natural immune system.`;
    if (coverage >= 15) return `Moderate green space coverage (${coverage.toFixed(0)}%). The city's natural immune system needs strengthening.`;
    return `Low green space coverage (${coverage.toFixed(0)}%). The city's natural immune system is compromised.`;
  }

  /**
   * Generate infection description
   */
  private static generateInfectionDescription(disasters: number, pollution: number): string {
    const total = disasters + pollution;
    
    if (total === 0) return 'No recent environmental hazards detected. The city is clean and healthy.';
    if (total <= 2) return `Low environmental stress (${total} hazard(s) detected). Minor environmental concerns.`;
    if (total <= 5) return `Moderate environmental stress (${total} hazard(s) detected). Environmental monitoring needed.`;
    return `High environmental stress (${total} hazard(s) detected). Immediate environmental intervention required.`;
  }

  /**
   * Get mock location data for testing
   */
  static getMockLocations(): typeof MockDataService.MOCK_LOCATIONS {
    return this.MOCK_LOCATIONS;
  }

  /**
   * Simulate API delay
   */
  static async simulateAPIDelay(minMs: number = 500, maxMs: number = 2000): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
