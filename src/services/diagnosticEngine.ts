import { CityVitals, DiagnosticResult, HealthScore } from '../types';

export class DiagnosticEngine {
  private static readonly HEALTH_THRESHOLDS = {
    excellent: 90,
    good: 75,
    fair: 60,
    poor: 40,
    critical: 0
  };

  private static readonly CATEGORY_WEIGHTS = {
    heartRate: 0.15,      // Nighttime lights - urban activity
    temperature: 0.20,    // Heat island effect
    bloodOxygen: 0.25,    // Air quality - most critical
    immuneSystem: 0.25,   // Green space - environmental health
    infections: 0.15      // Disasters and pollution
  };

  /**
   * Generate a comprehensive health diagnosis for a city
   */
  public static generateDiagnosis(vitals: CityVitals): DiagnosticResult {
    const categoryScores = this.calculateCategoryScores(vitals);
    const overallScore = this.calculateOverallScore(categoryScores);
    const diagnosis = this.generateDiagnosisText(overallScore, vitals);
    const recommendations = this.generateRecommendations(vitals, categoryScores);
    const severity = this.determineSeverity(overallScore);

    return {
      overallScore,
      categoryScores,
      diagnosis,
      recommendations,
      severity
    };
  }

  /**
   * Calculate health scores for each vital category
   */
  private static calculateCategoryScores(vitals: CityVitals): HealthScore[] {
    return [
      {
        category: 'Heart Rate (Urban Activity)',
        score: this.calculateHeartRateScore(vitals.heartRate),
        weight: this.CATEGORY_WEIGHTS.heartRate,
        status: vitals.heartRate.status
      },
      {
        category: 'Temperature (Heat Island)',
        score: this.calculateTemperatureScore(vitals.temperature),
        weight: this.CATEGORY_WEIGHTS.temperature,
        status: vitals.temperature.status
      },
      {
        category: 'Air Quality',
        score: this.calculateAirQualityScore(vitals.bloodOxygen),
        weight: this.CATEGORY_WEIGHTS.bloodOxygen,
        status: vitals.bloodOxygen.status
      },
      {
        category: 'Green Space',
        score: this.calculateGreenSpaceScore(vitals.immuneSystem),
        weight: this.CATEGORY_WEIGHTS.immuneSystem,
        status: vitals.immuneSystem.status
      },
      {
        category: 'Environmental Hazards',
        score: this.calculateInfectionsScore(vitals.infections),
        weight: this.CATEGORY_WEIGHTS.infections,
        status: vitals.infections.status
      }
    ];
  }

  /**
   * Calculate overall health score
   */
  private static calculateOverallScore(categoryScores: HealthScore[]): number {
    const weightedSum = categoryScores.reduce((sum, category) => {
      return sum + (category.score * category.weight);
    }, 0);
    
    return Math.round(weightedSum);
  }

  /**
   * Calculate heart rate score based on nighttime lights
   */
  private static calculateHeartRateScore(heartRate: CityVitals['heartRate']): number {
    // Nighttime lights intensity (0-100) - higher is better for urban activity
    let score = heartRate.value;
    
    // Adjust based on trend
    if (heartRate.trend === 'increasing') score += 5;
    else if (heartRate.trend === 'decreasing') score -= 5;
    
    // Adjust based on status
    if (heartRate.status === 'critical') score *= 0.5;
    else if (heartRate.status === 'elevated') score *= 0.8;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate temperature score based on heat island effect
   */
  private static calculateTemperatureScore(temperature: CityVitals['temperature']): number {
    let score = 100;
    
    // Penalize high temperatures
    if (temperature.value > 35) score -= 30;
    else if (temperature.value > 30) score -= 20;
    else if (temperature.value > 25) score -= 10;
    
    // Penalize heat island effect
    if (temperature.heatIslandEffect > 5) score -= 25;
    else if (temperature.heatIslandEffect > 3) score -= 15;
    else if (temperature.heatIslandEffect > 1) score -= 5;
    
    // Adjust based on trend
    if (temperature.trend === 'increasing') score -= 10;
    else if (temperature.trend === 'decreasing') score += 5;
    
    // Adjust based on status
    if (temperature.status === 'critical') score *= 0.3;
    else if (temperature.status === 'fever') score *= 0.6;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate air quality score
   */
  private static calculateAirQualityScore(bloodOxygen: CityVitals['bloodOxygen']): number {
    let score = 100 - bloodOxygen.value; // AQI is inverse (lower is better)
    
    // Penalize high pollutant levels
    const avgPollutants = (bloodOxygen.pollutants.no2 + bloodOxygen.pollutants.pm25 + bloodOxygen.pollutants.o3) / 3;
    if (avgPollutants > 50) score -= 30;
    else if (avgPollutants > 30) score -= 20;
    else if (avgPollutants > 15) score -= 10;
    
    // Adjust based on trend
    if (bloodOxygen.trend === 'worsening') score -= 15;
    else if (bloodOxygen.trend === 'improving') score += 10;
    
    // Adjust based on status
    if (bloodOxygen.status === 'hazardous') score *= 0.2;
    else if (bloodOxygen.status === 'unhealthy') score *= 0.5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate green space score
   */
  private static calculateGreenSpaceScore(immuneSystem: CityVitals['immuneSystem']): number {
    let score = immuneSystem.greenSpaceCoverage;
    
    // Boost score based on NDVI
    if (immuneSystem.ndvi > 0.7) score += 20;
    else if (immuneSystem.ndvi > 0.5) score += 10;
    else if (immuneSystem.ndvi < 0.2) score -= 20;
    
    // Adjust based on trend
    if (immuneSystem.trend === 'improving') score += 10;
    else if (immuneSystem.trend === 'declining') score -= 15;
    
    // Adjust based on status
    if (immuneSystem.status === 'compromised') score *= 0.4;
    else if (immuneSystem.status === 'weak') score *= 0.7;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate infections score (inverse - fewer is better)
   */
  private static calculateInfectionsScore(infections: CityVitals['infections']): number {
    let score = 100;
    
    // Penalize disasters and pollution
    const totalHazards = infections.disasterEvents + infections.pollutionHotspots;
    score -= totalHazards * 15;
    
    // Adjust based on status
    if (infections.status === 'critical') score *= 0.2;
    else if (infections.status === 'infected') score *= 0.5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate diagnosis text based on overall score and vitals
   */
  private static generateDiagnosisText(score: number, vitals: CityVitals): string {
    if (score >= 90) {
      return "This city is in excellent health! All vital signs are strong, showing a well-balanced urban ecosystem with good air quality, adequate green space, and minimal environmental hazards.";
    } else if (score >= 75) {
      return "The city shows good overall health with minor areas for improvement. Most vital signs are within normal ranges, but there may be some environmental concerns to address.";
    } else if (score >= 60) {
      return "The city's health is fair but requires attention. Several vital signs indicate moderate stress, particularly in air quality or heat management. Immediate action is recommended.";
    } else if (score >= 40) {
      return "The city is showing signs of poor health with multiple concerning vital signs. Environmental stress is evident, and comprehensive intervention is needed to restore urban wellness.";
    } else {
      return "CRITICAL: The city is in poor health with multiple critical vital signs. Immediate environmental intervention is required to prevent further degradation of urban health.";
    }
  }

  /**
   * Generate specific recommendations based on vitals
   */
  private static generateRecommendations(vitals: CityVitals, categoryScores: HealthScore[]): string[] {
    const recommendations: string[] = [];
    
    // Air quality recommendations
    if (vitals.bloodOxygen.status === 'hazardous' || vitals.bloodOxygen.status === 'unhealthy') {
      recommendations.push("🚗 Implement low-emission zones and promote electric vehicle adoption");
      recommendations.push("🌳 Increase urban tree canopy to filter air pollutants");
      recommendations.push("🚴 Develop comprehensive bike lane networks to reduce vehicle emissions");
    }
    
    // Heat island recommendations
    if (vitals.temperature.status === 'critical' || vitals.temperature.status === 'fever') {
      recommendations.push("🏢 Mandate cool roof technologies for new and existing buildings");
      recommendations.push("🌿 Create green corridors to channel cool air through the city");
      recommendations.push("💧 Implement water features and reflective surfaces in public spaces");
    }
    
    // Green space recommendations
    if (vitals.immuneSystem.status === 'weak' || vitals.immuneSystem.status === 'compromised') {
      recommendations.push("🌳 Establish pocket parks and community gardens in underserved areas");
      recommendations.push("🛤️ Develop green infrastructure corridors connecting parks and natural areas");
      recommendations.push("🏘️ Require green space minimums in new development projects");
    }
    
    // Disaster resilience recommendations
    if (vitals.infections.status === 'critical' || vitals.infections.status === 'infected') {
      recommendations.push("🛡️ Strengthen infrastructure resilience against natural disasters");
      recommendations.push("📊 Implement early warning systems for environmental hazards");
      recommendations.push("🏗️ Develop climate-adaptive building codes and zoning regulations");
    }
    
    // Urban activity recommendations
    if (vitals.heartRate.status === 'critical' || vitals.heartRate.status === 'elevated') {
      recommendations.push("🏙️ Promote mixed-use development to reduce urban sprawl");
      recommendations.push("🚌 Improve public transportation to reduce traffic congestion");
      recommendations.push("💡 Implement smart city technologies for efficient resource management");
    }
    
    // General recommendations if no specific issues
    if (recommendations.length === 0) {
      recommendations.push("✅ Continue monitoring urban health indicators");
      recommendations.push("📈 Set up long-term environmental monitoring systems");
      recommendations.push("🤝 Engage community in urban health initiatives");
    }
    
    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }

  /**
   * Determine severity level
   */
  private static determineSeverity(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 75) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  }
}
