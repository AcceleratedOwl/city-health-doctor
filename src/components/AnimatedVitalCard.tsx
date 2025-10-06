import React, { useState, useEffect } from 'react';

interface AnimatedVitalCardProps {
  title: string;
  value: number;
  unit: string;
  status: 'normal' | 'elevated' | 'critical' | 'healthy' | 'unhealthy' | 'hazardous' | 'strong' | 'weak' | 'compromised';
  trend: 'increasing' | 'stable' | 'decreasing' | 'improving' | 'worsening';
  description: string;
  icon: string;
  color: string;
  isVisible: boolean;
  delay?: number;
}

const AnimatedVitalCard: React.FC<AnimatedVitalCardProps> = ({
  title,
  value,
  unit,
  status,
  trend,
  description,
  icon,
  color,
  isVisible,
  delay = 0
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
        animateValue(0, value, 1000);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, value, delay]);

  const animateValue = (start: number, end: number, duration: number) => {
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = start + (end - start) * easeOutCubic;
      
      setDisplayValue(Math.round(currentValue));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
      case 'healthy':
      case 'strong':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'elevated':
      case 'unhealthy':
      case 'weak':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'critical':
      case 'hazardous':
      case 'compromised':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
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

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'worsening':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className={`medical-card transition-all duration-500 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${isAnimating ? 'scale-105' : 'scale-100'}`}
      style={{
        animationDelay: `${delay}ms`,
        borderLeftColor: color,
        borderLeftWidth: '4px'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg transition-all duration-300 hover:scale-110"
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 text-lg">{title}</h4>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                {status.toUpperCase()}
              </span>
              <span className={`text-sm ${getTrendColor(trend)}`}>
                {getTrendIcon(trend)} {trend}
              </span>
            </div>
          </div>
        </div>
        
        {/* Animated Value */}
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-800 transition-all duration-300">
            {isAnimating ? displayValue : 0}
          </div>
          <div className="text-sm text-gray-500">{unit}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-1000 ease-out"
            style={{
              backgroundColor: color,
              width: isAnimating ? `${Math.min((displayValue / 100) * 100, 100)}%` : '0%'
            }}
          />
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed">
        {description}
      </p>

      {/* Pulse Animation for Critical Status */}
      {status === 'critical' || status === 'hazardous' || status === 'compromised' ? (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
        </div>
      ) : null}

      {/* Hover Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transition-opacity duration-300 rounded-lg" />
    </div>
  );
};

export default AnimatedVitalCard;
