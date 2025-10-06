import React, { useState, useEffect, useMemo, useCallback } from 'react';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  fps: number;
  isSlowDevice: boolean;
}

const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({ children }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    fps: 60,
    isSlowDevice: false
  });
  const [isOptimized, setIsOptimized] = useState(false);

  // Detect slow devices
  useEffect(() => {
    const detectSlowDevice = () => {
      const connection = (navigator as any).connection;
      const hardwareConcurrency = navigator.hardwareConcurrency || 1;
      const memory = (performance as any).memory?.jsHeapSizeLimit || 0;
      
      const isSlowConnection = connection && (
        connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g' ||
        connection.downlink < 1
      );
      
      const isLowEndDevice = hardwareConcurrency <= 2 || memory < 100000000; // 100MB
      
      return isSlowConnection || isLowEndDevice;
    };

    const isSlow = detectSlowDevice();
    setMetrics(prev => ({ ...prev, isSlowDevice: isSlow }));
    setIsOptimized(isSlow);
  }, []);

  // Monitor performance
  useEffect(() => {
    const monitorPerformance = () => {
      const startTime = performance.now();
      
      requestAnimationFrame(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        const memory = (performance as any).memory;
        const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0;
        
        setMetrics(prev => ({
          ...prev,
          renderTime,
          memoryUsage
        }));
      });
    };

    const interval = setInterval(monitorPerformance, 1000);
    return () => clearInterval(interval);
  }, []);

  // Optimize based on device capabilities
  const optimizedChildren = useMemo(() => {
    if (!isOptimized) return children;

    // Apply optimizations for slow devices
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          ...child.props,
          // Reduce animations for slow devices
          style: {
            ...child.props.style,
            animationDuration: metrics.isSlowDevice ? '0.1s' : undefined,
            transitionDuration: metrics.isSlowDevice ? '0.1s' : undefined
          }
        });
      }
      return child;
    });
  }, [children, isOptimized, metrics.isSlowDevice]);

  // Lazy load heavy components
  const LazyComponent = useCallback(({ component, fallback }: { component: React.ComponentType, fallback: React.ReactNode }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
      if (metrics.isSlowDevice) {
        // Delay loading for slow devices
        const timer = setTimeout(() => setIsLoaded(true), 1000);
        return () => clearTimeout(timer);
      } else {
        setIsLoaded(true);
      }
    }, [metrics.isSlowDevice]);

    if (!isLoaded) return <>{fallback}</>;
    return React.createElement(component);
  }, [metrics.isSlowDevice]);

  // Debounce expensive operations
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  // Memory cleanup
  useEffect(() => {
    const cleanup = () => {
      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
      }
    };

    const interval = setInterval(cleanup, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="performance-optimizer">
      {/* Performance indicator for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          <div>Render: {metrics.renderTime.toFixed(1)}ms</div>
          <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
          <div>FPS: {metrics.fps}</div>
          <div>Slow: {metrics.isSlowDevice ? 'Yes' : 'No'}</div>
        </div>
      )}

      {/* Optimized children */}
      {optimizedChildren}

      {/* Performance warnings */}
      {metrics.isSlowDevice && (
        <div className="fixed bottom-4 left-4 right-4 z-40 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-yellow-800">
            <span className="text-lg">⚡</span>
            <span className="text-sm font-medium">Performance Mode</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Optimized for slower devices. Some animations may be reduced.
          </p>
        </div>
      )}

      {/* Memory usage warning */}
      {metrics.memoryUsage > 100 && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 border border-red-200 rounded-lg p-2">
          <div className="text-red-800 text-sm">
            High memory usage: {metrics.memoryUsage.toFixed(1)}MB
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceOptimizer;
