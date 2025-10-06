// Core data interfaces for CityPulse application

export interface CityVitals {
  heartRate: {
    value: number;        // Nighttime lights intensity (0-100)
    status: 'normal' | 'elevated' | 'critical';
    trend: 'increasing' | 'stable' | 'decreasing';
    description: string;
  };
  temperature: {
    value: number;        // Surface temperature in Celsius
    heatIslandEffect: number;  // Difference from surrounding area
    status: 'normal' | 'fever' | 'critical';
    trend: 'increasing' | 'stable' | 'decreasing';
    description: string;
  };
  bloodOxygen: {
    value: number;        // Air quality index (0-100)
    pollutants: {
      no2: number;
      pm25: number;
      o3: number;
    };
    status: 'healthy' | 'unhealthy' | 'hazardous';
    trend: 'improving' | 'stable' | 'worsening';
    description: string;
  };
  immuneSystem: {
    greenSpaceCoverage: number;  // % of area with vegetation
    ndvi: number;               // Normalized Difference Vegetation Index
    status: 'strong' | 'weak' | 'compromised';
    trend: 'improving' | 'stable' | 'declining';
    description: string;
  };
  infections: {
    disasterEvents: number;     // Number of recent natural disasters
    pollutionHotspots: number;  // Number of pollution hotspots
    status: 'clean' | 'infected' | 'critical';
    description: string;
  };
  overallHealth: {
    score: number;              // Overall health score (0-100)
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    diagnosis: string;
    recommendations: string[];
  };
}

export interface LocationData {
  lat: number;
  lon: number;
  city?: string;
  country?: string;
  timestamp: number;
}

// API Response interfaces
export interface OpenAQResponse {
  results: Array<{
    location: string;
    measurements: Array<{
      parameter: string;
      value: number;
      unit: string;
      lastUpdated: string;
    }>;
  }>;
}

export interface USGSEarthquakeResponse {
  type: string;
  features: Array<{
    properties: {
      mag: number;
      place: string;
      time: number;
      updated: number;
      url: string;
      detail: string;
      felt?: number;
      cdi?: number;
      mmi?: number;
      alert?: string;
      status: string;
      tsunami: number;
      sig: number;
      net: string;
      code: string;
      ids: string;
      sources: string;
      types: string;
      nst: number;
      dmin: number;
      rms: number;
      gap: number;
      magType: string;
      type: string;
      title: string;
    };
    geometry: {
      type: string;
      coordinates: [number, number, number];
    };
    id: string;
  }>;
}

export interface GHSLResponse {
  type: string;
  features: Array<{
    type: string;
    geometry: {
      type: string;
      coordinates: [number, number];
    };
    properties: {
      population: number;
      density: number;
    };
  }>;
}

export interface WeatherResponse {
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  coord: {
    lon: number;
    lat: number;
  };
  name: string;
}

// Component props interfaces
export interface MapProps {
  onLocationSelect: (location: LocationData) => void;
  selectedLocation?: LocationData;
  isLoading?: boolean;
}

export interface VitalsPanelProps {
  vitals: CityVitals | null;
  isLoading: boolean;
  location?: LocationData;
}

export interface DiagnosisCardProps {
  vitals: CityVitals;
  location: LocationData;
}

export interface PrescriptionListProps {
  recommendations: string[];
  vitals: CityVitals;
}

export interface DataLayerToggleProps {
  activeLayers: string[];
  onToggleLayer: (layer: string) => void;
}

// API Service interfaces
export interface APIService {
  fetchData(lat: number, lon: number): Promise<any>;
  isHealthy(): boolean;
  getLastError(): string | null;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface RateLimiter {
  canMakeRequest(): boolean;
  recordRequest(): void;
  getRemainingRequests(): number;
}

// Error handling
export interface APIError {
  service: string;
  message: string;
  code?: number;
  timestamp: number;
}

// Health scoring
export interface HealthScore {
  category: string;
  score: number;
  weight: number;
  status: string;
}

export interface DiagnosticResult {
  overallScore: number;
  categoryScores: HealthScore[];
  diagnosis: string;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}
