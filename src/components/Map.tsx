import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapProps, LocationData } from '../types';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for health status
const createCustomIcon = (status: 'healthy' | 'warning' | 'critical' = 'healthy') => {
  const color = status === 'healthy' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      border: 3px solid #ffffff;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Component to handle map clicks
const MapClickHandler: React.FC<{
  onLocationSelect: (location: LocationData) => void;
  isLoading: boolean;
}> = ({ onLocationSelect, isLoading }) => {
  useMapEvents({
    click: (e) => {
      if (isLoading) return;
      
      const { lat, lng } = e.latlng;
      const location: LocationData = {
        lat: parseFloat(lat.toFixed(6)),
        lon: parseFloat(lng.toFixed(6)),
        timestamp: Date.now(),
      };
      
      onLocationSelect(location);
    },
  });
  
  return null;
};

const Map: React.FC<MapProps> = ({ 
  onLocationSelect, 
  selectedLocation, 
  isLoading = false 
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([34.0522, -118.2437]); // Default to Los Angeles
  const mapRef = useRef<L.Map>(null);

  // Update map center when location is selected
  useEffect(() => {
    if (selectedLocation) {
      setMapCenter([selectedLocation.lat, selectedLocation.lon]);
      if (mapRef.current) {
        mapRef.current.setView([selectedLocation.lat, selectedLocation.lon], 12);
      }
    }
  }, [selectedLocation]);

  return (
    <div className="h-full w-full relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[1000]">
          <div className="flex flex-col items-center space-y-4">
            <div className="heartbeat">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">❤️</span>
              </div>
            </div>
            <div className="text-lg font-medium text-gray-700">
              Analyzing city vitals...
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Map container */}
      <MapContainer
        center={mapCenter}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Click handler */}
        <MapClickHandler 
          onLocationSelect={onLocationSelect} 
          isLoading={isLoading}
        />
        
        {/* Selected location marker */}
        {selectedLocation && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lon]}
            icon={createCustomIcon('healthy')}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-800">City Health Analysis</h3>
                <p className="text-sm text-gray-600">
                  Lat: {selectedLocation.lat.toFixed(4)}<br />
                  Lon: {selectedLocation.lon.toFixed(4)}
                </p>
                {selectedLocation.city && (
                  <p className="text-sm font-medium text-blue-600">
                    {selectedLocation.city}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Instructions overlay */}
      {!selectedLocation && !isLoading && (
        <div className="absolute top-4 left-4 right-4 bg-white bg-opacity-90 rounded-lg p-4 shadow-lg z-[999]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-lg">📍</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Click anywhere on the map</h3>
              <p className="text-sm text-gray-600">
                Select a location to analyze its urban health vitals
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
