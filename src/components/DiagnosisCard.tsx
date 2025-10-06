import React from 'react';
import { DiagnosisCardProps } from '../types';

const DiagnosisCard: React.FC<DiagnosisCardProps> = ({ vitals, location }) => {
  const getSeverityColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'good':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'fair':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'poor':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return '🟢';
      case 'good':
        return '🔵';
      case 'fair':
        return '🟡';
      case 'poor':
        return '🟠';
      case 'critical':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div className="medical-card">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 text-xl">🩺</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Health Diagnosis</h3>
          <p className="text-sm text-gray-600">
            {location.city || `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`}
          </p>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`p-4 rounded-lg border-2 ${getSeverityColor(vitals.overallHealth.status)} mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getSeverityIcon(vitals.overallHealth.status)}</span>
            <span className="font-semibold text-lg">
              {vitals.overallHealth.status.toUpperCase()}
            </span>
          </div>
          <div className="text-2xl font-bold">
            {vitals.overallHealth.score}/100
          </div>
        </div>
        <div className="w-full bg-white bg-opacity-50 rounded-full h-3 mb-3">
          <div 
            className="bg-current h-3 rounded-full transition-all duration-500"
            style={{ width: `${vitals.overallHealth.score}%` }}
          ></div>
        </div>
      </div>

      {/* Diagnosis Text */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">Medical Assessment</h4>
        <p className="text-gray-700 leading-relaxed">
          {vitals.overallHealth.diagnosis}
        </p>
      </div>

      {/* Key Recommendations */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Prescribed Solutions</h4>
        <div className="space-y-2">
          {vitals.overallHealth.recommendations.slice(0, 3).map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-blue-600 text-sm font-medium mt-0.5">
                {index + 1}.
              </span>
              <span className="text-sm text-gray-700 flex-1">
                {recommendation}
              </span>
            </div>
          ))}
        </div>
        
        {vitals.overallHealth.recommendations.length > 3 && (
          <div className="mt-2 text-xs text-gray-500">
            +{vitals.overallHealth.recommendations.length - 3} more recommendations available
          </div>
        )}
      </div>

      {/* Vital Signs Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3">Vital Signs Summary</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Heart Rate</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              vitals.heartRate.status === 'normal' ? 'bg-green-100 text-green-800' :
              vitals.heartRate.status === 'elevated' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {vitals.heartRate.status}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Temperature</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              vitals.temperature.status === 'normal' ? 'bg-green-100 text-green-800' :
              vitals.temperature.status === 'fever' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {vitals.temperature.status}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Air Quality</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              vitals.bloodOxygen.status === 'healthy' ? 'bg-green-100 text-green-800' :
              vitals.bloodOxygen.status === 'unhealthy' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {vitals.bloodOxygen.status}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Green Space</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              vitals.immuneSystem.status === 'strong' ? 'bg-green-100 text-green-800' :
              vitals.immuneSystem.status === 'weak' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {vitals.immuneSystem.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisCard;
