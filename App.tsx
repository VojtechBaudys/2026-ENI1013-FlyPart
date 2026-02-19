import React, { useState, useEffect, useCallback } from 'react';
import { MapLayer } from './components/MapLayer';
import { Telemetry } from './components/Cockpit/Telemetry';
import { DroneList } from './components/Cockpit/DroneList';
import { DeliveryManifest } from './components/Cockpit/DeliveryManifest';
import { Button, StatusItem, Card } from './components/ui/BaseComponents';
import { Coordinates, MapMode, DeliveryOrder, Drone } from './types';
import { INITIAL_FLEET, MOCK_MISSION_LOGS, MOCK_ORDERS, HUBS, generateRandomOrder, MAX_DELIVERY_RADIUS_KM } from './constants';
import { 
  Wifi, 
  Settings, 
  Bell, 
  Navigation,
  Target,
  Layers,
  ShieldCheck,
  Home,
  Truck,
  Locate,
  Hammer,
  Zap,
  Droplets,
  ArrowLeftRight
} from 'lucide-react';

// Physics Constants
const TICK_RATE_MS = 200;
const TICK_SECONDS = TICK_RATE_MS / 1000;
const CRUISE_SPEED_KMH = 50; // User Request: Max 50km/h
const REPOSITION_SPEED_KMH = 60; // Slightly faster when empty
const CRUISE_ALTITUDE = 60;
const BATTERY_DRAIN_FLIGHT = 0.025; // Adjusted for slower speed/longer flights

const App: React.FC = () => {
  // -- State --
  const [drones, setDrones] = useState<Drone[]>(INITIAL_FLEET);
  const [selectedDroneId, setSelectedDroneId] = useState<string>(INITIAL_FLEET[0].id);
  const [logs, setLogs] = useState<string[]>(MOCK_MISSION_LOGS.map(l => `[${l.time}] ${l.event}`));
  const [mapMode, setMapMode] = useState<MapMode>(MapMode.SATELLITE);
  const [isTracking, setIsTracking] = useState(true);
  const [availableOrders, setAvailableOrders] = useState<DeliveryOrder[]>(MOCK_ORDERS);
  const [currentETA, setCurrentETA] = useState<string | null>(null);

  // Derived
  const selectedDrone = drones.find(d => d.id === selectedDroneId) || drones[0];
  const currentHub = HUBS.find(h => h.id === selectedDrone.currentHubId) || HUBS[0];

  // -- Helpers --
  const addLog = useCallback((message: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 50));
  }, []);
  
  // Physics helper accessible to components
  const getDistanceKm = useCallback((p1: Coordinates, p2: Coordinates) => {
    const R = 6371; 
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLng = (p2.lng - p1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const handleMapInteraction = useCallback(() => {
    setIsTracking(prev => {
      if (prev) return false;
      return prev;
    });
  }, []);

  const selectDrone = (id: string) => {
    setSelectedDroneId(id);
    setIsTracking(true); 
  };

  const handleHubSelection = useCallback((hubId: string) => {
    // If we are already viewing a drone from this hub, do nothing
    const currentSelectedDrone = drones.find(d => d.id === selectedDroneId);
    if (currentSelectedDrone?.currentHubId === hubId) return;

    // Find the first drone belonging to this hub
    const droneAtHub = drones.find(d => d.currentHubId === hubId);
    
    if (droneAtHub) {
      setSelectedDroneId(droneAtHub.id);
      setIsTracking(true);
      const hubName = HUBS.find(h => h.id === hubId)?.name;
      addLog(`Switched Dashboard View to ${hubName}`);
    }
  }, [drones, selectedDroneId, addLog]);

  const assignOrderToDrone = useCallback((droneId: string, order: DeliveryOrder) => {
    setDrones(prevDrones => {
      const droneIndex = prevDrones.findIndex(d => d.id === droneId);
      if (droneIndex === -1) return prevDrones;
      
      const drone = prevDrones[droneIndex];
      // Only assign if at correct hub
      if (drone.currentHubId !== order.hubId) return prevDrones;

      const updatedDrone = { ...drone, activeOrder: order, flightPhaseTime: 0 };
      updatedDrone.telemetry.status = 'TAKING_OFF';
      
      addLog(`${drone.label}: Auto-Dispatch to ${order.locationName} (${order.item})`);
      
      const newDrones = [...prevDrones];
      newDrones[droneIndex] = updatedDrone;
      return newDrones;
    });

    setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
  }, [addLog]);

  const repositionDrone = useCallback((droneId: string, targetHubId: string) => {
    setDrones(prevDrones => {
      const droneIndex = prevDrones.findIndex(d => d.id === droneId);
      if (droneIndex === -1) return prevDrones;

      const drone = prevDrones[droneIndex];
      const targetHub = HUBS.find(h => h.id === targetHubId);
      
      if (!targetHub) return prevDrones;

      const updatedDrone = { 
        ...drone, 
        targetHubId: targetHubId,
        flightPhaseTime: 0 
      };
      updatedDrone.telemetry.status = 'REPOSITIONING';
      
      addLog(`${drone.label}: Redeploying to ${targetHub.name} for demand coverage.`);
      
      const newDrones = [...prevDrones];
      newDrones[droneIndex] = updatedDrone;
      return newDrones;
    });
  }, [addLog]);

  // -- INTELLIGENT DISPATCH SYSTEM --
  // Runs every time drones or availableOrders change
  useEffect(() => {
    // 1. Find idle drones that are FULLY CHARGED
    const idleDrones = drones.filter(d => 
      d.telemetry.status === 'IDLE_AT_BASE' && 
      !d.activeOrder && 
      d.telemetry.battery >= 100 // STRICT RULE: Must be 100% charged
    );

    if (idleDrones.length === 0) return;

    // 2. Try to assign LOCAL orders first (Highest Priority)
    for (const drone of idleDrones) {
       const droneHub = HUBS.find(h => h.id === drone.currentHubId);
       // Find valid orders (at this hub AND within range)
       const localOrder = availableOrders.find(o => {
         if (o.hubId !== drone.currentHubId || o.status !== 'PENDING') return false;
         // Check range constraint
         if (droneHub) {
            const dist = getDistanceKm(droneHub.coordinates, o.coordinates);
            return dist <= MAX_DELIVERY_RADIUS_KM;
         }
         return false;
       });

       if (localOrder) {
         assignOrderToDrone(drone.id, localOrder);
         return; // Process one assignment per tick to ensure state stability
       }
    }

    // 3. If no local orders, check for IMBALANCE and REPOSITION
    // Find hubs with pending orders but NO idle drones present
    const needyHubs = HUBS.filter(hub => {
      const hasOrders = availableOrders.some(o => o.hubId === hub.id);
      const hasIdleDrones = drones.some(d => d.currentHubId === hub.id && d.telemetry.status === 'IDLE_AT_BASE');
      const hasIncomingDrones = drones.some(d => d.targetHubId === hub.id);
      
      return hasOrders && !hasIdleDrones && !hasIncomingDrones;
    });

    if (needyHubs.length > 0 && idleDrones.length > 0) {
      const targetHub = needyHubs[0];
      // Pick the first available idle drone that is NOT at the target hub
      const candidate = idleDrones.find(d => d.currentHubId !== targetHub.id);
      
      if (candidate) {
        repositionDrone(candidate.id, targetHub.id);
      }
    }

  }, [drones, availableOrders, assignOrderToDrone, repositionDrone, getDistanceKm]);

  const calculatePositionUpdate = (current: Coordinates, target: Coordinates, speedKmh: number) => {
    const distanceToTarget = getDistanceKm(current, target);
    const distanceStepKm = (speedKmh / 3600) * TICK_SECONDS;

    const y = Math.sin(target.lng * Math.PI/180 - current.lng * Math.PI/180) * Math.cos(target.lat * Math.PI/180);
    const x = Math.cos(current.lat * Math.PI/180) * Math.sin(target.lat * Math.PI/180) -
              Math.sin(current.lat * Math.PI/180) * Math.cos(target.lat * Math.PI/180) * Math.cos(target.lng * Math.PI/180 - current.lng * Math.PI/180);
    const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;

    if (distanceToTarget <= distanceStepKm) {
      return { lat: target.lat, lng: target.lng, dist: 0, heading: bearing, reached: true };
    }

    const ratio = distanceStepKm / distanceToTarget;
    const newLat = current.lat + (target.lat - current.lat) * ratio;
    const newLng = current.lng + (target.lng - current.lng) * ratio;

    return { lat: newLat, lng: newLng, dist: distanceToTarget - distanceStepKm, heading: bearing, reached: false };
  };

  // -- Simulation Loop --
  useEffect(() => {
    const interval = setInterval(() => {
      setDrones(currentDrones => {
        return currentDrones.map(drone => {
          let { altitude, speed, status, battery, heading, signalStrength } = drone.telemetry;
          let { position, activeOrder, flightPhaseTime, currentHubId, targetHubId } = drone;
          let history = drone.history;
          
          const currentHub = HUBS.find(h => h.id === currentHubId) || HUBS[0];

          flightPhaseTime += 1;
          const tick = flightPhaseTime;

          if (status === 'IDLE_AT_BASE') {
             battery = Math.min(100, battery + 0.5);
          } else {
             battery = Math.max(0, battery - BATTERY_DRAIN_FLIGHT);
          }

          if (status === 'TAKING_OFF') {
            altitude += 3.5;
            speed = 0;
            if (altitude >= CRUISE_ALTITUDE) {
              altitude = CRUISE_ALTITUDE;
              status = 'EN_ROUTE_TO_SITE';
              flightPhaseTime = 0;
            }
          } 
          else if (status === 'EN_ROUTE_TO_SITE' && activeOrder) {
            speed = CRUISE_SPEED_KMH;
            altitude = CRUISE_ALTITUDE + Math.sin(tick/20) * 2;
            
            const move = calculatePositionUpdate(position, activeOrder.coordinates, speed);
            position = { lat: move.lat, lng: move.lng };
            heading = move.heading;

            if (move.reached) {
              status = 'DELIVERING';
              flightPhaseTime = 0;
            }
          }
          else if (status === 'DELIVERING') {
            speed = 0;
            if (tick < 15) altitude = Math.max(5, altitude - 4);
            else if (tick < 35) altitude = 5; 
            else altitude = Math.min(CRUISE_ALTITUDE, altitude + 4);

            if (tick > 50) {
              status = 'RETURNING_TO_BASE';
              flightPhaseTime = 0;
              activeOrder = { ...activeOrder!, status: 'DELIVERED' };
            }
          }
          else if (status === 'RETURNING_TO_BASE') {
            speed = CRUISE_SPEED_KMH;
            altitude = CRUISE_ALTITUDE + 10;
            
            // Return to assigned Hub
            const move = calculatePositionUpdate(position, currentHub.coordinates, speed);
            position = { lat: move.lat, lng: move.lng };
            heading = move.heading;

            if (move.reached) {
              status = 'LANDING';
              flightPhaseTime = 0;
            }
          }
          // --- REPOSITIONING LOGIC ---
          else if (status === 'REPOSITIONING' && targetHubId) {
            speed = REPOSITION_SPEED_KMH;
            altitude = CRUISE_ALTITUDE + 20; 
            
            const destHub = HUBS.find(h => h.id === targetHubId) || HUBS[0];
            const move = calculatePositionUpdate(position, destHub.coordinates, speed);
            
            position = { lat: move.lat, lng: move.lng };
            heading = move.heading;

            if (move.reached) {
              status = 'LANDING';
              currentHubId = targetHubId; // Update new home base
              targetHubId = undefined;
              flightPhaseTime = 0;
            }
          }
          else if (status === 'LANDING') {
            speed = 0;
            altitude -= 3;
            if (altitude <= 0) {
              altitude = 0;
              status = 'IDLE_AT_BASE';
              activeOrder = null;
            }
          }

          const distFromBase = getDistanceKm(position, currentHub.coordinates);
          let targetSignal = 100 - (distFromBase * 2) + (Math.random() * 6 - 3);
          signalStrength = Math.floor(Math.max(0, Math.min(100, targetSignal)));

          if (tick % 5 === 0) {
            history = [...history, {
              time: new Date().toLocaleTimeString(),
              altitude,
              speed
            }].slice(-20);
          }

          return {
            ...drone,
            position,
            currentHubId,
            targetHubId,
            activeOrder,
            flightPhaseTime,
            history,
            telemetry: { ...drone.telemetry, altitude, speed, status, battery, heading, signalStrength }
          };
        });
      });
    }, TICK_RATE_MS);

    return () => clearInterval(interval);
  }, []); // getDistanceKm is stable

  // -- ETA Calculation --
  useEffect(() => {
    const droneHub = HUBS.find(h => h.id === selectedDrone.currentHubId) || HUBS[0];
    
    if (selectedDrone.telemetry.status === 'IDLE_AT_BASE') {
      setCurrentETA(null);
      return;
    }

    let target: Coordinates;
    let speed = CRUISE_SPEED_KMH;

    if (selectedDrone.telemetry.status === 'REPOSITIONING' && selectedDrone.targetHubId) {
        const h = HUBS.find(h => h.id === selectedDrone.targetHubId);
        target = h ? h.coordinates : droneHub.coordinates;
        speed = REPOSITION_SPEED_KMH;
    } else if (selectedDrone.telemetry.status === 'EN_ROUTE_TO_SITE' && selectedDrone.activeOrder) {
      target = selectedDrone.activeOrder.coordinates;
      speed = CRUISE_SPEED_KMH;
    } else {
      target = droneHub.coordinates;
      speed = CRUISE_SPEED_KMH;
    }

    const distKm = getDistanceKm(selectedDrone.position, target);
    const timeHours = distKm / speed;
    const timeSeconds = Math.floor(timeHours * 3600);
    const min = Math.floor(timeSeconds / 60);
    const sec = timeSeconds % 60;

    setCurrentETA(`${min}m ${sec}s`);

  }, [selectedDrone.position, selectedDrone.activeOrder, selectedDrone.telemetry.status, selectedDrone.currentHubId, selectedDrone.targetHubId, getDistanceKm]);

  // -- Incoming Order Simulation --
  useEffect(() => {
    const orderInterval = setInterval(() => {
      // 50% chance to generate order every 1.5s (High demand)
      if (Math.random() < 0.5) { 
        setAvailableOrders(prev => {
          if (prev.length >= 10) return prev;
          const newOrder = generateRandomOrder();
          return [newOrder, ...prev];
        });
      }
    }, 1500);
    return () => clearInterval(orderInterval);
  }, []);

  const cycleMapMode = () => {
    const modes = Object.values(MapMode);
    const nextIndex = (modes.indexOf(mapMode) + 1) % modes.length;
    setMapMode(modes[nextIndex]);
  };

  const HubIcon = currentHub.category === 'ELECTRICAL' ? Zap : currentHub.category === 'PLUMBING' ? Droplets : Hammer;

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-950 text-slate-200">
      <MapLayer 
        drones={drones}
        selectedDroneId={selectedDroneId}
        mode={mapMode} 
        isTracking={isTracking}
        onMapInteraction={handleMapInteraction}
        onSelectDrone={selectDrone}
        onSelectHub={handleHubSelection}
      />

      {/* Top Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4">
           <Card className="px-4 py-2 flex items-center gap-3">
             <div className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold shadow-lg 
               ${currentHub.category === 'ELECTRICAL' ? 'bg-blue-600 shadow-blue-900/50' : 
                 currentHub.category === 'PLUMBING' ? 'bg-amber-600 shadow-amber-900/50' : 
                 'bg-emerald-600 shadow-emerald-900/50'}`}>
               <HubIcon className="w-5 h-5" />
             </div>
             <div>
               <h1 className="text-sm font-bold text-white tracking-wider">FLYPART DASHBOARD</h1>
               <div className="flex items-center gap-2 text-[10px] text-slate-300">
                 <span className={`w-2 h-2 rounded-full animate-pulse ${
                    currentHub.category === 'ELECTRICAL' ? 'bg-blue-400' : 
                    currentHub.category === 'PLUMBING' ? 'bg-amber-400' : 
                    'bg-emerald-400'
                 }`}></span>
                 CURRENT HUB: {currentHub.name.toUpperCase()}
               </div>
             </div>
           </Card>
           
           <div className="flex gap-2">
             <StatusItem icon={Target} label="ID" value={selectedDrone.label} color="text-slate-300" />
             <StatusItem icon={Wifi} label="Net" value={`${selectedDrone.telemetry.signalStrength}%`} />
             <StatusItem icon={Navigation} label="Sats" value={`${selectedDrone.telemetry.satelliteCount}`} />
             <StatusItem icon={Home} label="Dist" value={currentETA ? `${currentETA} away` : 'At Base'} />
           </div>
        </div>

        <div className="pointer-events-auto flex gap-2">
           <Button 
             size="icon" 
             variant={isTracking ? "primary" : "secondary"} 
             onClick={() => setIsTracking(true)}
             title="Track Selected Drone"
             className={!isTracking ? "border-emerald-500 text-emerald-500" : ""}
           >
             <Locate className="w-4 h-4" />
           </Button>
           <Button size="icon" variant="secondary" onClick={cycleMapMode}>
             <Layers className="w-4 h-4" />
           </Button>
           <Button size="icon" variant="secondary">
             <Bell className="w-4 h-4" />
           </Button>
           <Button size="icon" variant="secondary">
             <Settings className="w-4 h-4" />
           </Button>
        </div>
      </header>

      {/* Main HUD Layout */}
      <main className="absolute inset-0 z-10 pointer-events-none flex p-4 pt-24 pb-6 gap-4">
        
        {/* Left Column */}
        <div className="w-80 flex flex-col gap-4 pointer-events-auto">
          <Telemetry data={selectedDrone.telemetry} history={selectedDrone.history} />
          
          <DeliveryManifest 
            order={selectedDrone.activeOrder} 
            availableOrders={availableOrders.filter(o => o.hubId === selectedDrone.currentHubId)} 
            status={selectedDrone.telemetry.status}
            eta={currentETA}
          />
          
          <Card className="flex-1 p-4 bg-slate-900/90 overflow-hidden flex flex-col min-h-[100px]">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" /> Network Events
            </h3>
            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[10px] text-slate-300">
              {logs.map((log, i) => (
                <div key={i} className="border-l-2 border-slate-700 pl-2 py-0.5 opacity-80 hover:opacity-100">
                  {log}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Center Messages */}
        <div className="flex-1 flex flex-col justify-end items-center pointer-events-none pb-4">
           {selectedDrone.telemetry.status === 'DELIVERING' && (
             <div className="pointer-events-auto mb-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-6 py-3 rounded-full backdrop-blur-md flex items-center gap-3 animate-bounce shadow-lg shadow-emerald-900/50">
               <Truck className="w-6 h-6" />
               <span className="font-bold tracking-wider text-lg">ARRIVED ON SITE: {selectedDrone.activeOrder?.recipient.split(' ')[0]}</span>
             </div>
           )}
           {selectedDrone.telemetry.status === 'REPOSITIONING' && (
             <div className="pointer-events-auto mb-4 bg-blue-500/20 border border-blue-500/50 text-blue-200 px-6 py-2 rounded-full backdrop-blur-md flex items-center gap-2">
               <ArrowLeftRight className="w-5 h-5" />
               <span className="font-bold tracking-wider">{selectedDrone.label}: REPOSITIONING TO {HUBS.find(h => h.id === selectedDrone.targetHubId)?.name.toUpperCase()}</span>
             </div>
           )}
           {selectedDrone.telemetry.status === 'RETURNING_TO_BASE' && (
             <div className="pointer-events-auto mb-4 bg-blue-500/20 border border-blue-500/50 text-blue-200 px-6 py-2 rounded-full backdrop-blur-md flex items-center gap-2">
               <Home className="w-5 h-5" />
               <span className="font-bold tracking-wider">{selectedDrone.label}: RTB</span>
             </div>
           )}
        </div>

        {/* Right Column */}
        <div className="w-96 flex flex-col gap-4 pointer-events-auto h-full">
          <div className="flex-1 min-h-0">
            <DroneList drones={drones} selectedDroneId={selectedDroneId} onSelectDrone={selectDrone} />
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;