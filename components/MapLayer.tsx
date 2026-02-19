import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import { MapMode, Drone } from '../types';
import { MAP_TILES, MAP_ATTRIBUTION, HUBS, KNOWN_SITES, MAX_DELIVERY_RADIUS_KM } from '../constants';

// --- Custom Icons ---

const getIconStyles = (color: string, shape: 'rounded-lg' | 'rounded-full', pulse: boolean = false) => `
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Drone Icon
const createDroneIcon = (isSelected: boolean, heading: number) => L.divIcon({
  className: 'custom-drone-icon',
  html: `
    <div style="${getIconStyles('emerald', 'rounded-full')}">
      <div class="absolute inset-0 bg-emerald-500/20 rounded-full border border-emerald-400/30 ${isSelected ? 'animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)]' : ''}"></div>
      <div class="relative z-10 w-7 h-7 bg-slate-900 border border-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)]" style="transform: rotate(${heading}deg); transition: transform 0.3s ease-out;">
         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="${isSelected ? 'text-white' : 'text-emerald-500'}">
            <rect x="10" y="10" width="4" height="4" rx="1" fill="${isSelected ? '#10b981' : 'none'}" stroke="none" />
            <rect x="10" y="10" width="4" height="4" rx="1" />
            <path d="M10 10L6 6" />
            <path d="M14 10L18 6" />
            <path d="M10 14L6 18" />
            <path d="M14 14L18 18" />
            <circle cx="5" cy="5" r="2" fill="${isSelected ? '#10b981' : 'none'}" />
            <circle cx="19" cy="5" r="2" fill="${isSelected ? '#10b981' : 'none'}" />
            <circle cx="5" cy="19" r="2" fill="${isSelected ? '#10b981' : 'none'}" />
            <circle cx="19" cy="19" r="2" fill="${isSelected ? '#10b981' : 'none'}" />
            <path d="M12 8L12 3" stroke-width="2" stroke="${isSelected ? '#10b981' : 'currentColor'}"/>
         </svg>
      </div>
    </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Warehouse Icon Factory
const createHubIcon = (color: string) => L.divIcon({
  className: 'custom-warehouse-icon',
  html: `
    <div style="${getIconStyles(color, 'rounded-lg')}">
      <div class="absolute inset-0 bg-${color}-500/20 rounded-lg border border-${color}-400/30 animate-pulse"></div>
      <div class="relative z-10 w-7 h-7 bg-slate-900 border border-${color}-500 rounded-md flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.6)]">
         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-${color}-400"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </div>
    </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Site Pad
const sitePadIcon = L.divIcon({
  className: 'custom-site-pad-icon',
  html: `
    <div style="${getIconStyles('cyan', 'rounded-lg')}">
      <div class="absolute inset-0 bg-cyan-500/10 rounded-lg border border-cyan-400/30"></div>
      <div class="relative z-10 w-7 h-7 bg-slate-900 border border-cyan-400 rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.5)]">
         <span class="text-[10px] font-black text-cyan-400 font-mono">H</span>
      </div>
    </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Destination
const destinationIcon = L.divIcon({
  className: 'custom-dest-icon',
  html: `
    <div style="${getIconStyles('amber', 'rounded-full')}">
      <div class="absolute inset-0 bg-amber-500/20 rounded-full border border-amber-400/30 animate-pulse"></div>
      <div class="relative z-10 w-7 h-7 bg-slate-900 border border-amber-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.6)]">
         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

interface MapLayerProps {
  drones: Drone[];
  selectedDroneId: string;
  mode: MapMode;
  isTracking: boolean;
  onMapInteraction: () => void;
  onSelectDrone: (id: string) => void;
  onSelectHub: (id: string) => void;
}

const MapController: React.FC<{ targetDrone: Drone | undefined; isTracking: boolean }> = ({ targetDrone, isTracking }) => {
  const map = useMap();
  
  useEffect(() => {
    if (isTracking && targetDrone) {
      const { lat, lng } = targetDrone.position;
      const center = map.getCenter();
      const dist = center.distanceTo([lat, lng]);
      
      if (dist > 1) { 
        map.panTo([lat, lng], {
          animate: true,
          duration: 0.5,
          easeLinearity: 0.5
        });
      }
    }
  }, [targetDrone, map, isTracking]);
  
  return null;
};

const MapEvents: React.FC<{ onInteraction: () => void }> = React.memo(({ onInteraction }) => {
  const map = useMap();
  useMapEvents({
    dragstart: () => { map.stop(); onInteraction(); },
    zoomstart: () => { onInteraction(); },
    mousedown: () => { onInteraction(); },
    touchstart: () => { onInteraction(); }
  });
  return null;
});

export const MapLayer: React.FC<MapLayerProps> = ({ drones, selectedDroneId, mode, isTracking, onMapInteraction, onSelectDrone, onSelectHub }) => {
  const selectedDrone = drones.find(d => d.id === selectedDroneId);

  return (
    <div className="absolute inset-0 z-0 bg-slate-950">
      <MapContainer 
        center={[HUBS[0].coordinates.lat, HUBS[0].coordinates.lng]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
      >
        <TileLayer attribution={MAP_ATTRIBUTION} url={MAP_TILES[mode]} />
        <MapEvents onInteraction={onMapInteraction} />
        
        {/* Render Radius Circles for Hubs */}
        {HUBS.map(hub => (
          <Circle 
            key={`radius-${hub.id}`}
            center={[hub.coordinates.lat, hub.coordinates.lng]}
            radius={MAX_DELIVERY_RADIUS_KM * 1000} // Radius in meters
            pathOptions={{ 
              color: hub.color === 'emerald' ? '#10b981' : hub.color === 'blue' ? '#3b82f6' : '#f59e0b',
              fillColor: hub.color === 'emerald' ? '#10b981' : hub.color === 'blue' ? '#3b82f6' : '#f59e0b',
              fillOpacity: 0.05,
              weight: 1,
              dashArray: '5, 10' 
            }}
          />
        ))}

        {/* Known Site Pads */}
        {KNOWN_SITES.map((site, index) => (
          <Marker 
            key={`site-${index}`} 
            position={[site.coords.lat, site.coords.lng]} 
            icon={sitePadIcon}
            zIndexOffset={-50} 
          >
            <Popup className="font-sans text-slate-900">
              <div className="text-xs uppercase font-bold text-cyan-600 mb-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                VERIFIED LANDING PAD
              </div>
              <strong>{site.name}</strong><br/>
              <span className="text-xs text-slate-500">{site.type}</span>
            </Popup>
          </Marker>
        ))}

        {/* Render All Hubs */}
        {HUBS.map(hub => (
          <Marker 
            key={hub.id} 
            position={[hub.coordinates.lat, hub.coordinates.lng]} 
            icon={createHubIcon(hub.color)} 
            zIndexOffset={100}
            eventHandlers={{
              click: () => onSelectHub(hub.id)
            }}
          >
            <Popup className="font-sans text-slate-900">
              <strong>{hub.name}</strong><br />
              <span className="text-xs text-slate-500 uppercase">{hub.category} HUB</span>
            </Popup>
          </Marker>
        ))}

        {/* Render Drones */}
        {drones.map(drone => {
          const isSelected = drone.id === selectedDroneId;
          const currentHub = HUBS.find(h => h.id === drone.currentHubId) || HUBS[0];
          const targetHub = HUBS.find(h => h.id === drone.targetHubId);
          
          return (
            <React.Fragment key={drone.id}>
              {/* Route Line for Selected Drone */}
              {isSelected && drone.activeOrder && (
                <>
                  <Polyline 
                    positions={[
                      [currentHub.coordinates.lat, currentHub.coordinates.lng], 
                      [drone.activeOrder.coordinates.lat, drone.activeOrder.coordinates.lng]
                    ]} 
                    pathOptions={{ color: '#f59e0b', dashArray: '10, 10', weight: 3, opacity: 0.6 }} 
                  />
                  {/* Destination Marker */}
                  <Marker 
                    position={[drone.activeOrder.coordinates.lat, drone.activeOrder.coordinates.lng]} 
                    icon={drone.activeOrder.locationType === 'KNOWN_PAD' ? sitePadIcon : destinationIcon} 
                    zIndexOffset={50}
                  />
                </>
              )}

              {/* Repositioning Line */}
              {isSelected && drone.telemetry.status === 'REPOSITIONING' && targetHub && (
                 <Polyline 
                    positions={[
                      [drone.position.lat, drone.position.lng], 
                      [targetHub.coordinates.lat, targetHub.coordinates.lng]
                    ]} 
                    pathOptions={{ color: '#3b82f6', dashArray: '5, 10', weight: 2, opacity: 0.5 }} 
                  />
              )}

              <Marker 
                position={[drone.position.lat, drone.position.lng]} 
                icon={createDroneIcon(isSelected, drone.telemetry.heading)}
                eventHandlers={{
                  click: () => onSelectDrone(drone.id)
                }}
                zIndexOffset={isSelected ? 1000 : 0}
              >
                <Popup className="font-sans text-slate-900">
                  <strong>{drone.label}</strong><br />
                  <span className="text-[10px] text-slate-500 uppercase">
                    AT: {currentHub.name}
                    {drone.telemetry.status === 'REPOSITIONING' && targetHub && ` -> ${targetHub.name}`}
                  </span><br/>
                  Bat: {drone.telemetry.battery.toFixed(1)}%<br/>
                  Status: {drone.telemetry.status}
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
        
        <MapController targetDrone={selectedDrone} isTracking={isTracking} />
      </MapContainer>
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[400] opacity-10" 
           style={{ backgroundImage: 'linear-gradient(#00ff00 1px, transparent 1px), linear-gradient(90deg, #00ff00 1px, transparent 1px)', backgroundSize: '100px 100px' }}>
      </div>
    </div>
  );
};