import React, { useState, useEffect } from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsPortrait(height > width);
      
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const getLayoutClasses = () => {
    switch (screenSize) {
      case 'mobile':
        return {
          container: 'px-4 py-4',
          grid: 'grid-cols-1 gap-4',
          mapHeight: 'h-64',
          sidebarHeight: 'h-auto',
          textSize: 'text-sm',
          padding: 'p-4'
        };
      case 'tablet':
        return {
          container: 'px-6 py-6',
          grid: 'grid-cols-1 lg:grid-cols-3 gap-6',
          mapHeight: 'h-96',
          sidebarHeight: 'h-auto',
          textSize: 'text-base',
          padding: 'p-6'
        };
      case 'desktop':
        return {
          container: 'px-8 py-8',
          grid: 'grid-cols-1 lg:grid-cols-3 gap-8',
          mapHeight: 'h-[calc(100vh-200px)]',
          sidebarHeight: 'h-[calc(100vh-200px)]',
          textSize: 'text-base',
          padding: 'p-8'
        };
      default:
        return {
          container: 'px-8 py-8',
          grid: 'grid-cols-1 lg:grid-cols-3 gap-8',
          mapHeight: 'h-[calc(100vh-200px)]',
          sidebarHeight: 'h-[calc(100vh-200px)]',
          textSize: 'text-base',
          padding: 'p-8'
        };
    }
  };

  const layoutClasses = getLayoutClasses();

  return (
    <div 
      className={`min-h-screen transition-all duration-300 ${layoutClasses.container}`}
      data-screen-size={screenSize}
      data-orientation={isPortrait ? 'portrait' : 'landscape'}
    >
      {/* Screen size indicator for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 z-50 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          {screenSize} {isPortrait ? 'portrait' : 'landscape'}
        </div>
      )}

      {/* Responsive grid layout */}
      <div className={`grid ${layoutClasses.grid} ${layoutClasses.mapHeight}`}>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              ...child.props,
              className: `${child.props.className || ''} ${
                index === 0 ? layoutClasses.mapHeight : layoutClasses.sidebarHeight
              } ${layoutClasses.textSize} ${layoutClasses.padding}`
            });
          }
          return child;
        })}
      </div>

      {/* Mobile-specific enhancements */}
      {screenSize === 'mobile' && (
        <div className="fixed bottom-4 left-4 right-4 z-40">
          <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">📱 Mobile Optimized</p>
              <p>Tap anywhere on the map to analyze city health</p>
            </div>
          </div>
        </div>
      )}

      {/* Tablet-specific enhancements */}
      {screenSize === 'tablet' && (
        <div className="hidden lg:block">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex items-center space-x-2 text-blue-800">
              <span className="text-lg">📱</span>
              <span className="text-sm font-medium">Tablet View</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Optimized for tablet viewing. Click on the map to analyze city health.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveLayout;
