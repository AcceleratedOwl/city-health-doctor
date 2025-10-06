import React from 'react';
import { VitalsPanelProps, CityVitals } from '../types';

const VitalsPanel: React.FC<VitalsPanelProps> = ({ vitals, isLoading, location }) => {
  if (isLoading) {
    return (
      <div className="h-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-lg">🏥</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">City Vitals</h2>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="medical-card animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!vitals) {
    return (
      <div className="h-full bg-white rounded-lg shadow-lg p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">📍</span>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Location Selected</h3>
          <p className="text-sm text-gray-500">
            Click on the map to analyze a city's health vitals
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'normal':
      case 'strong':
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'elevated':
      case 'weak':
      case 'good':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'hazardous':
      case 'compromised':
      case 'poor':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
      case 'worsening':
        return '📈';
      case 'decreasing':
      case 'improving':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '➡️';
    }
  };

  return (
    <div className="h-full bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 text-lg">🏥</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">City Vitals</h2>
          {location && (
            <p className="text-sm text-gray-600">
              {location.city || `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`}
            </p>
          )}
        </div>
      </div>

      {/* Overall Health Score */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">Overall Health</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vitals.overallHealth.status)}`}>
            {vitals.overallHealth.status.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold text-blue-600">
            {vitals.overallHealth.score}
          </div>
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${vitals.overallHealth.score}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">Health Score</p>
          </div>
        </div>
      </div>

      {/* Individual Vitals */}
      <div className="space-y-4">
        {/* Heart Rate (Nighttime Lights) */}
        <div className="medical-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💓</span>
              <h4 className="font-semibold text-gray-800">Heart Rate</h4>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-800">{vitals.heartRate.value}</span>
              <span className="text-sm text-gray-500">bpm</span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vitals.heartRate.status)}`}>
              {vitals.heartRate.status}
            </span>
            <span className="text-sm text-gray-600">
              {getTrendIcon(vitals.heartRate.trend)} {vitals.heartRate.trend}
            </span>
          </div>
          <p className="text-sm text-gray-600">{vitals.heartRate.description}</p>
        </div>

        {/* Temperature (Heat Island) */}
        <div className="medical-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌡️</span>
              <h4 className="font-semibold text-gray-800">Temperature</h4>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-800">{vitals.temperature.value}°C</span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vitals.temperature.status)}`}>
              {vitals.temperature.status}
            </span>
            <span className="text-sm text-gray-600">
              {getTrendIcon(vitals.temperature.trend)} {vitals.temperature.trend}
            </span>
          </div>
          <p className="text-sm text-gray-600">{vitals.temperature.description}</p>
          <div className="mt-2 text-xs text-gray-500">
            Heat Island Effect: +{vitals.temperature.heatIslandEffect}°C
          </div>
        </div>

        {/* Blood Oxygen (Air Quality) */}
        <div className="medical-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🫁</span>
              <h4 className="font-semibold text-gray-800">Air Quality</h4>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-800">{vitals.bloodOxygen.value}</span>
              <span className="text-sm text-gray-500">AQI</span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vitals.bloodOxygen.status)}`}>
              {vitals.bloodOxygen.status}
            </span>
            <span className="text-sm text-gray-600">
              {getTrendIcon(vitals.bloodOxygen.trend)} {vitals.bloodOxygen.trend}
            </span>
          </div>
          <p className="text-sm text-gray-600">{vitals.bloodOxygen.description}</p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium text-gray-700">NO₂</div>
              <div className="text-gray-600">{vitals.bloodOxygen.pollutants.no2} µg/m³</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-700">PM2.5</div>
              <div className="text-gray-600">{vitals.bloodOxygen.pollutants.pm25} µg/m³</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-700">O₃</div>
              <div className="text-gray-600">{vitals.bloodOxygen.pollutants.o3} µg/m³</div>
            </div>
          </div>
        </div>

        {/* Immune System (Green Space) */}
        <div className="medical-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌿</span>
              <h4 className="font-semibold text-gray-800">Green Space</h4>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-800">{vitals.immuneSystem.greenSpaceCoverage}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vitals.immuneSystem.status)}`}>
              {vitals.immuneSystem.status}
            </span>
            <span className="text-sm text-gray-600">
              {getTrendIcon(vitals.immuneSystem.trend)} {vitals.immuneSystem.trend}
            </span>
          </div>
          <p className="text-sm text-gray-600">{vitals.immuneSystem.description}</p>
          <div className="mt-2 text-xs text-gray-500">
            NDVI: {vitals.immuneSystem.ndvi.toFixed(2)}
          </div>
        </div>

        {/* Infections (Disasters/Pollution) */}
        <div className="medical-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🦠</span>
              <h4 className="font-semibold text-gray-800">Infections</h4>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-800">{vitals.infections.disasterEvents + vitals.infections.pollutionHotspots}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vitals.infections.status)}`}>
              {vitals.infections.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">{vitals.infections.description}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium text-gray-700">Disasters</div>
              <div className="text-gray-600">{vitals.infections.disasterEvents}</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-700">Pollution</div>
              <div className="text-gray-600">{vitals.infections.pollutionHotspots}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VitalsPanel;
