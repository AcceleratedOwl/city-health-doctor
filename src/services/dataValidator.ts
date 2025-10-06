import { CityVitals, LocationData, OpenAQResponse, USGSEarthquakeResponse, WeatherResponse } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data?: any;
}

export interface DataQualityReport {
  overallScore: number;
  issues: string[];
  recommendations: string[];
  timestamp: number;
}

export class DataValidator {
  /**
   * Validate location data
   */
  static validateLocation(location: LocationData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (typeof location.lat !== 'number' || isNaN(location.lat)) {
      errors.push('Latitude must be a valid number');
    } else if (location.lat < -90 || location.lat > 90) {
      errors.push('Latitude must be between -90 and 90 degrees');
    }

    if (typeof location.lon !== 'number' || isNaN(location.lon)) {
      errors.push('Longitude must be a valid number');
    } else if (location.lon < -180 || location.lon > 180) {
      errors.push('Longitude must be between -180 and 180 degrees');
    }

    if (typeof location.timestamp !== 'number' || isNaN(location.timestamp)) {
      errors.push('Timestamp must be a valid number');
    } else {
      const age = Date.now() - location.timestamp;
      if (age > 24 * 60 * 60 * 1000) { // 24 hours
        warnings.push('Location data is more than 24 hours old');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      data: location
    };
  }

  /**
   * Validate OpenAQ API response
   */
  static validateAirQualityData(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data) {
      errors.push('No data received from air quality API');
      return { isValid: false, errors, warnings };
    }

    if (!data.results || !Array.isArray(data.results)) {
      errors.push('Invalid data structure: missing or invalid results array');
    } else if (data.results.length === 0) {
      warnings.push('No air quality data available for this location');
    } else {
      // Validate individual results
      data.results.forEach((result: any, index: number) => {
        if (!result.location) {
          warnings.push(`Result ${index + 1}: missing location information`);
        }
        if (!result.measurements || !Array.isArray(result.measurements)) {
          warnings.push(`Result ${index + 1}: missing or invalid measurements`);
        } else {
          result.measurements.forEach((measurement: any, mIndex: number) => {
            if (!measurement.parameter) {
              warnings.push(`Result ${index + 1}, Measurement ${mIndex + 1}: missing parameter`);
            }
            if (typeof measurement.value !== 'number' || isNaN(measurement.value)) {
              warnings.push(`Result ${index + 1}, Measurement ${mIndex + 1}: invalid value`);
            }
            if (measurement.value < 0) {
              warnings.push(`Result ${index + 1}, Measurement ${mIndex + 1}: negative value detected`);
            }
            if (measurement.value > 1000) {
              warnings.push(`Result ${index + 1}, Measurement ${mIndex + 1}: unusually high value detected`);
            }
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      data
    };
  }

  /**
   * Validate USGS Earthquake API response
   */
  static validateEarthquakeData(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data) {
      errors.push('No data received from earthquake API');
      return { isValid: false, errors, warnings };
    }

    if (!data.features || !Array.isArray(data.features)) {
      errors.push('Invalid data structure: missing or invalid features array');
    } else {
      // Validate individual features
      data.features.forEach((feature: any, index: number) => {
        if (!feature.properties) {
          warnings.push(`Feature ${index + 1}: missing properties`);
        } else {
          if (typeof feature.properties.mag !== 'number' || isNaN(feature.properties.mag)) {
            warnings.push(`Feature ${index + 1}: invalid magnitude`);
          }
          if (typeof feature.properties.time !== 'number' || isNaN(feature.properties.time)) {
            warnings.push(`Feature ${index + 1}: invalid timestamp`);
          } else {
            const eventAge = Date.now() - feature.properties.time;
            if (eventAge > 365 * 24 * 60 * 60 * 1000) { // 1 year
              warnings.push(`Feature ${index + 1}: earthquake is more than 1 year old`);
            }
          }
        }

        if (!feature.geometry) {
          warnings.push(`Feature ${index + 1}: missing geometry`);
        } else if (!feature.geometry.coordinates || !Array.isArray(feature.geometry.coordinates)) {
          warnings.push(`Feature ${index + 1}: invalid coordinates`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      data
    };
  }

  /**
   * Validate Weather API response
   */
  static validateWeatherData(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data) {
      errors.push('No data received from weather API');
      return { isValid: false, errors, warnings };
    }

    if (!data.main) {
      errors.push('Invalid data structure: missing main object');
    } else {
      if (typeof data.main.temp !== 'number' || isNaN(data.main.temp)) {
        errors.push('Invalid temperature data');
      } else {
        if (data.main.temp < -50 || data.main.temp > 60) {
          warnings.push('Temperature value seems unrealistic');
        }
      }

      if (typeof data.main.humidity !== 'number' || isNaN(data.main.humidity)) {
        warnings.push('Invalid humidity data');
      } else if (data.main.humidity < 0 || data.main.humidity > 100) {
        warnings.push('Humidity value out of expected range (0-100%)');
      }

      if (typeof data.main.pressure !== 'number' || isNaN(data.main.pressure)) {
        warnings.push('Invalid pressure data');
      } else if (data.main.pressure < 800 || data.main.pressure > 1100) {
        warnings.push('Pressure value seems unrealistic');
      }
    }

    if (!data.coord) {
      warnings.push('Missing coordinate information');
    } else {
      if (typeof data.coord.lat !== 'number' || typeof data.coord.lon !== 'number') {
        warnings.push('Invalid coordinate data');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      data
    };
  }

  /**
   * Validate processed city vitals
   */
  static validateCityVitals(vitals: CityVitals): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate heart rate
    if (typeof vitals.heartRate.value !== 'number' || isNaN(vitals.heartRate.value)) {
      errors.push('Invalid heart rate value');
    } else if (vitals.heartRate.value < 0 || vitals.heartRate.value > 200) {
      warnings.push('Heart rate value seems unrealistic');
    }

    // Validate temperature
    if (typeof vitals.temperature.value !== 'number' || isNaN(vitals.temperature.value)) {
      errors.push('Invalid temperature value');
    } else if (vitals.temperature.value < -50 || vitals.temperature.value > 60) {
      warnings.push('Temperature value seems unrealistic');
    }

    // Validate air quality
    if (typeof vitals.bloodOxygen.value !== 'number' || isNaN(vitals.bloodOxygen.value)) {
      errors.push('Invalid air quality value');
    } else if (vitals.bloodOxygen.value < 0 || vitals.bloodOxygen.value > 500) {
      warnings.push('Air quality value out of expected range');
    }

    // Validate pollutants
    const pollutants = vitals.bloodOxygen.pollutants;
    if (typeof pollutants.no2 !== 'number' || pollutants.no2 < 0) {
      warnings.push('Invalid NO2 value');
    }
    if (typeof pollutants.pm25 !== 'number' || pollutants.pm25 < 0) {
      warnings.push('Invalid PM2.5 value');
    }
    if (typeof pollutants.o3 !== 'number' || pollutants.o3 < 0) {
      warnings.push('Invalid O3 value');
    }

    // Validate green space
    if (typeof vitals.immuneSystem.greenSpaceCoverage !== 'number' || isNaN(vitals.immuneSystem.greenSpaceCoverage)) {
      errors.push('Invalid green space coverage value');
    } else if (vitals.immuneSystem.greenSpaceCoverage < 0 || vitals.immuneSystem.greenSpaceCoverage > 100) {
      warnings.push('Green space coverage out of expected range (0-100%)');
    }

    if (typeof vitals.immuneSystem.ndvi !== 'number' || isNaN(vitals.immuneSystem.ndvi)) {
      errors.push('Invalid NDVI value');
    } else if (vitals.immuneSystem.ndvi < -1 || vitals.immuneSystem.ndvi > 1) {
      warnings.push('NDVI value out of expected range (-1 to 1)');
    }

    // Validate infections
    if (typeof vitals.infections.disasterEvents !== 'number' || vitals.infections.disasterEvents < 0) {
      warnings.push('Invalid disaster events count');
    }
    if (typeof vitals.infections.pollutionHotspots !== 'number' || vitals.infections.pollutionHotspots < 0) {
      warnings.push('Invalid pollution hotspots count');
    }

    // Validate overall health
    if (typeof vitals.overallHealth.score !== 'number' || isNaN(vitals.overallHealth.score)) {
      errors.push('Invalid overall health score');
    } else if (vitals.overallHealth.score < 0 || vitals.overallHealth.score > 100) {
      warnings.push('Overall health score out of expected range (0-100)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      data: vitals
    };
  }

  /**
   * Generate data quality report
   */
  static generateQualityReport(vitals: CityVitals): DataQualityReport {
    const validation = this.validateCityVitals(vitals);
    const issues: string[] = [...validation.errors, ...validation.warnings];
    
    let overallScore = 100;
    overallScore -= validation.errors.length * 20; // Major penalty for errors
    overallScore -= validation.warnings.length * 5; // Minor penalty for warnings
    overallScore = Math.max(0, overallScore);

    const recommendations: string[] = [];
    
    if (validation.errors.length > 0) {
      recommendations.push('Fix critical data validation errors');
    }
    if (validation.warnings.length > 0) {
      recommendations.push('Review and address data quality warnings');
    }
    if (overallScore < 80) {
      recommendations.push('Improve data quality and validation');
    }
    if (overallScore < 60) {
      recommendations.push('Consider using alternative data sources');
    }

    return {
      overallScore,
      issues,
      recommendations,
      timestamp: Date.now()
    };
  }

  /**
   * Sanitize and clean data
   */
  static sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };

    // Remove null/undefined values
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === null || sanitized[key] === undefined) {
        delete sanitized[key];
      }
    });

    // Sanitize strings
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitized[key].trim();
      }
    });

    // Sanitize numbers
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'number' && isNaN(sanitized[key])) {
        delete sanitized[key];
      }
    });

    return sanitized;
  }

  /**
   * Check if data is stale
   */
  static isDataStale(timestamp: number, maxAgeMs: number = 5 * 60 * 1000): boolean {
    return Date.now() - timestamp > maxAgeMs;
  }

  /**
   * Validate API response structure
   */
  static validateAPIResponse(service: string, data: any): ValidationResult {
    switch (service) {
      case 'airQuality':
        return this.validateAirQualityData(data);
      case 'earthquake':
        return this.validateEarthquakeData(data);
      case 'weather':
        return this.validateWeatherData(data);
      default:
        return {
          isValid: false,
          errors: [`Unknown service: ${service}`],
          warnings: []
        };
    }
  }
}
