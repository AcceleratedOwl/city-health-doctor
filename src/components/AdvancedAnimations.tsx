import React, { useState, useEffect, useRef } from 'react';

interface AdvancedAnimationsProps {
  children: React.ReactNode;
  isVisible: boolean;
}

const AdvancedAnimations: React.FC<AdvancedAnimationsProps> = ({ children, isVisible }) => {
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'entering' | 'active' | 'exiting'>('idle');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && animationPhase === 'idle') {
      setAnimationPhase('entering');
      setTimeout(() => setAnimationPhase('active'), 300);
    } else if (!isVisible && animationPhase === 'active') {
      setAnimationPhase('exiting');
      setTimeout(() => setAnimationPhase('idle'), 300);
    }
  }, [isVisible, animationPhase]);

  const getAnimationClasses = () => {
    switch (animationPhase) {
      case 'entering':
        return 'animate-fade-in animate-slide-up';
      case 'active':
        return 'animate-pulse-gentle';
      case 'exiting':
        return 'animate-fade-out animate-slide-down';
      default:
        return '';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-500 ${getAnimationClasses()}`}
    >
      {children}
    </div>
  );
};

// EKG Line Animation Component
export const EKGLine: React.FC<{ isActive: boolean; color?: string }> = ({ 
  isActive, 
  color = '#ef4444' 
}) => {
  const [pathLength, setPathLength] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      const path = svgRef.current.querySelector('path');
      if (path) {
        setPathLength(path.getTotalLength());
      }
    }
  }, []);

  return (
    <svg
      ref={svgRef}
      className={`w-full h-16 ${isActive ? 'animate-pulse' : ''}`}
      viewBox="0 0 400 60"
      fill="none"
    >
      <path
        d="M0,30 Q50,10 100,30 T200,30 T300,30 T400,30"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={isActive ? 0 : pathLength}
        className="transition-all duration-1000"
      />
      {isActive && (
        <circle
          cx="200"
          cy="30"
          r="3"
          fill={color}
          className="animate-ping"
        />
      )}
    </svg>
  );
};

// Heartbeat Animation Component
export const Heartbeat: React.FC<{ isActive: boolean; size?: number }> = ({ 
  isActive, 
  size = 24 
}) => {
  return (
    <div
      className={`inline-block ${isActive ? 'animate-pulse-heart' : ''}`}
      style={{ fontSize: `${size}px` }}
    >
      ❤️
    </div>
  );
};

// Pulse Wave Animation
export const PulseWave: React.FC<{ 
  isActive: boolean; 
  color?: string; 
  intensity?: 'low' | 'medium' | 'high' 
}> = ({ isActive, color = '#10b981', intensity = 'medium' }) => {
  const getIntensityClass = () => {
    switch (intensity) {
      case 'low': return 'animate-pulse';
      case 'medium': return 'animate-pulse-heart';
      case 'high': return 'animate-bounce-gentle';
      default: return 'animate-pulse';
    }
  };

  return (
    <div
      className={`w-4 h-4 rounded-full ${isActive ? getIntensityClass() : ''}`}
      style={{ backgroundColor: color }}
    />
  );
};

// Data Flow Animation
export const DataFlow: React.FC<{ 
  isActive: boolean; 
  direction?: 'up' | 'down' | 'left' | 'right' 
}> = ({ isActive, direction = 'up' }) => {
  const getDirectionClass = () => {
    switch (direction) {
      case 'up': return 'animate-bounce';
      case 'down': return 'animate-bounce-reverse';
      case 'left': return 'animate-slide-left';
      case 'right': return 'animate-slide-right';
      default: return 'animate-bounce';
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${isActive ? getDirectionClass() : ''}`}>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
    </div>
  );
};

// Loading Spinner with Medical Theme
export const MedicalSpinner: React.FC<{ 
  size?: 'small' | 'medium' | 'large';
  color?: string;
}> = ({ size = 'medium', color = '#1e40af' }) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'w-4 h-4';
      case 'medium': return 'w-8 h-8';
      case 'large': return 'w-12 h-12';
      default: return 'w-8 h-8';
    }
  };

  return (
    <div className={`${getSizeClass()} relative`}>
      <div
        className="absolute inset-0 border-2 border-gray-200 rounded-full"
      />
      <div
        className="absolute inset-0 border-2 border-transparent border-t-current rounded-full animate-spin"
        style={{ color }}
      />
    </div>
  );
};

// Vital Sign Indicator
export const VitalIndicator: React.FC<{
  status: 'normal' | 'elevated' | 'critical';
  isActive: boolean;
}> = ({ status, isActive }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'normal':
        return { color: '#10b981', icon: '✅', animation: 'animate-pulse' };
      case 'elevated':
        return { color: '#f59e0b', icon: '⚠️', animation: 'animate-bounce' };
      case 'critical':
        return { color: '#ef4444', icon: '🚨', animation: 'animate-ping' };
      default:
        return { color: '#6b7280', icon: '⚪', animation: '' };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`flex items-center space-x-2 ${isActive ? config.animation : ''}`}
      style={{ color: config.color }}
    >
      <span className="text-lg">{config.icon}</span>
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: config.color }}
      />
    </div>
  );
};

export default AdvancedAnimations;
