import { Coordinates, DeliveryOrder, Drone, Hub, TradeCategory } from './types';

// --- CONFIGURATION ---
export const MAX_DELIVERY_RADIUS_KM = 5.1; // Maximum safe return range (Reduced by 15%)
export const WAREHOUSE_LOCATION: Coordinates = { lat: 53.372381, lng: -6.284498 };

// --- HUB DEFINITIONS ---
export const HUBS: Hub[] = [
  {
    id: 'HUB-GLASNEVIN',
    name: "Woodie's Glasnevin",
    coordinates: { lat: 53.372381, lng: -6.284498 },
    category: 'GENERAL',
    color: 'emerald'
  },
  {
    id: 'HUB-SANTRY',
    name: "Trade Electric Group",
    coordinates: { lat: 53.3953145512664, lng: -6.245147892039364 },
    category: 'ELECTRICAL',
    color: 'blue'
  },
  {
    id: 'HUB-INSTANTOR',
    name: "Sanbra Fyffe Limited T/A Instantor",
    coordinates: { lat: 53.39788636377807, lng: -6.248739017187713 },
    category: 'PLUMBING',
    color: 'amber'
  }
];

// --- FLEET GENERATION ---
// Distributed fleet across hubs
export const INITIAL_FLEET: Drone[] = [];

HUBS.forEach((hub, hubIndex) => {
  // Start with 2 Drones per hub
  for (let i = 0; i < 2; i++) {
    const droneId = `FP-${hub.category.substring(0,1)}${hubIndex}-${100 + i}`;
    const latOffset = -0.0002 - (i * 0.0001); 
    const lngOffset = -0.0002 + (i * 0.0001);

    INITIAL_FLEET.push({
      id: droneId,
      currentHubId: hub.id,
      label: `Unit ${droneId.split('-')[1]}`,
      position: { 
        lat: hub.coordinates.lat + latOffset, 
        lng: hub.coordinates.lng + lngOffset 
      },
      telemetry: {
        altitude: 0,
        speed: 0,
        battery: 85 + Math.random() * 15,
        satelliteCount: 14 + (i % 3),
        signalStrength: 100,
        heading: 0,
        status: 'IDLE_AT_BASE'
      },
      history: [],
      activeOrder: null,
      flightPhaseTime: 0
    });
  }
});


// --- ITEMS & ORDER GENERATION ---

const CATALOG: { name: string; weight: string; category: TradeCategory }[] = [
  // Electrical (Trade Electric)
  { name: 'Wago Connectors (100pk)', weight: '0.4kg', category: 'ELECTRICAL' },
  { name: 'Fuse Board Module (32A)', weight: '0.2kg', category: 'ELECTRICAL' },
  { name: 'Smoke Alarm Battery (9V)', weight: '0.1kg', category: 'ELECTRICAL' },
  { name: 'Cat6 Cable Reel (305m)', weight: '12kg', category: 'ELECTRICAL' },
  { name: 'LED Downlight Kit', weight: '0.8kg', category: 'ELECTRICAL' },

  // Plumbing (Sanbra Fyffe/Instantor)
  { name: '15mm Copper Elbows (20)', weight: '0.8kg', category: 'PLUMBING' },
  { name: 'Plumber\'s Mate Putty', weight: '0.5kg', category: 'PLUMBING' },
  { name: 'PVC Solvent Weld', weight: '0.3kg', category: 'PLUMBING' },
  { name: 'Expansion Vessel (5L)', weight: '2.5kg', category: 'PLUMBING' },
  { name: 'Radiator Valve Set', weight: '0.6kg', category: 'PLUMBING' },

  // General (Woodies)
  { name: 'Silicone Sealant (Clear)', weight: '0.3kg', category: 'GENERAL' },
  { name: 'M12 Masonry Drill Bit', weight: '0.1kg', category: 'GENERAL' },
  { name: 'Angle Grinder Disc (Metal)', weight: '0.2kg', category: 'GENERAL' },
  { name: 'Teflon Tape (10 rolls)', weight: '0.1kg', category: 'GENERAL' },
  { name: 'Wood Screws (500pk)', weight: '1.2kg', category: 'GENERAL' },
];

const RECIPIENTS = [
  'Mick (Sparks)', 'John (Plumbing)', 'Pat (Site Foreman)', 'Dermo (HVAC)', 
  'Sarah (Elec)', 'Brendan (Carpentry)', 'Fix-It Felix', 'Mario (Plumbing)'
];

const RESIDENTIAL_STREETS = [
  'Willow Park Rd', 'Sycamore Rd', 'Griffith Ave', 'Mobhi Rd', 'Ballymun Rd', 
  'Botanic Rd', 'Finglas Rd', 'Old Cabra Rd', 'Navan Rd', 'Oscar Traynor Rd', 'Malahide Rd'
];

export const KNOWN_SITES = [
  // North
  { name: 'Ballymun Civic Ctr', coords: { lat: 53.3950, lng: -6.2600 }, type: 'GOVERNMENT' },
  { name: 'DCU Campus Maint.', coords: { lat: 53.3850, lng: -6.2570 }, type: 'INSTITUTION' }, 
  { name: 'Whitehall Traffic Corps', coords: { lat: 53.3820, lng: -6.2350 }, type: 'GOVERNMENT' },
  { name: 'Griffith Ave Works', coords: { lat: 53.3750, lng: -6.2400 }, type: 'PUBLIC' },
  { name: 'Fairview Park Site', coords: { lat: 53.3650, lng: -6.2350 }, type: 'PUBLIC' },
  { name: 'Croke Park Maint.', coords: { lat: 53.3600, lng: -6.2500 }, type: 'COMMERCIAL' },
  { name: 'Tolka Park Lights', coords: { lat: 53.3670, lng: -6.2520 }, type: 'COMMERCIAL' },
  { name: 'Mater Hospital Works', coords: { lat: 53.3580, lng: -6.2650 }, type: 'MEDICAL' },
  { name: 'Phibsboro Shopping Ctr', coords: { lat: 53.3590, lng: -6.2750 }, type: 'COMMERCIAL' },
  { name: 'Stoneybatter Reno', coords: { lat: 53.3550, lng: -6.2850 }, type: 'RESIDENTIAL' },
  { name: 'Glasnevin Cemetery', coords: { lat: 53.3700, lng: -6.2780 }, type: 'PUBLIC' },
  { name: 'Botanic Gardens Reno', coords: { lat: 53.3720, lng: -6.2700 }, type: 'PUBLIC' },
  { name: 'Ashtown Gate Lodge', coords: { lat: 53.3700, lng: -6.3100 }, type: 'RESIDENTIAL' },
  { name: 'Finglas Village Site', coords: { lat: 53.3850, lng: -6.3000 }, type: 'COMMERCIAL' },
  { name: 'Johnstown Park', coords: { lat: 53.3780, lng: -6.2950 }, type: 'PUBLIC' },
  { name: 'Beaumont Hospital', coords: { lat: 53.3900, lng: -6.2100 }, type: 'MEDICAL' }, 
  { name: 'Santry Stadium', coords: { lat: 53.4000, lng: -6.2400 }, type: 'PUBLIC' },
];

export const generateRandomOrder = (): DeliveryOrder => {
  const itemData = CATALOG[Math.floor(Math.random() * CATALOG.length)];
  const recipient = RECIPIENTS[Math.floor(Math.random() * RECIPIENTS.length)];
  
  // Assign to correct Hub based on item category
  const targetHub = HUBS.find(h => h.category === itemData.category) || HUBS[0];

  const isKnownSite = Math.random() > 0.5;

  let locationName = '';
  let coords: Coordinates;
  let locationType: 'KNOWN_PAD' | 'DYNAMIC_SITE';

  if (isKnownSite) {
    // For known sites, find one that is loosely within range of the target hub
    // To ensure validity, we filter sites or just pick one and the dispatcher will reject if out of range
    // For simulation smoothness, let's pick one relatively close
    const site = KNOWN_SITES[Math.floor(Math.random() * KNOWN_SITES.length)];
    locationName = site.name;
    locationType = 'KNOWN_PAD';
    coords = { lat: site.coords.lat, lng: site.coords.lng };
  } else {
    const street = RESIDENTIAL_STREETS[Math.floor(Math.random() * RESIDENTIAL_STREETS.length)];
    const number = Math.floor(Math.random() * 150) + 1;
    locationName = `${number} ${street}`;
    locationType = 'DYNAMIC_SITE';
    
    // Generate strictly within MAX_DELIVERY_RADIUS_KM
    // 1 degree lat approx 111km. 1km approx 0.009 deg.
    const maxDeg = (MAX_DELIVERY_RADIUS_KM - 0.5) * 0.009; // -0.5km buffer
    
    const r = maxDeg * Math.sqrt(Math.random()); 
    const theta = Math.random() * 2 * Math.PI;
    coords = {
      lat: targetHub.coordinates.lat + r * Math.cos(theta),
      lng: targetHub.coordinates.lng + (r * Math.sin(theta) * 1.6) // 1.6 aspect correction for lat/lng at this latitude
    };
  }

  return {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    hubId: targetHub.id,
    recipient,
    locationName,
    locationType,
    item: itemData.name,
    category: itemData.category,
    weight: itemData.weight,
    coordinates: coords,
    status: 'PENDING'
  };
};

export const MOCK_ORDERS: DeliveryOrder[] = [
  generateRandomOrder(),
  generateRandomOrder(),
  generateRandomOrder(),
  generateRandomOrder(),
];

export const MOCK_MISSION_LOGS = [
  { id: '1', time: '08:00:00', event: 'Multi-Hub Network Online', type: 'info' },
  { id: '2', time: '08:00:05', event: 'Hubs Connected: Glasnevin, Santry, Instantor', type: 'success' },
  { id: '3', time: '08:01:00', event: 'Weather: Clear. Wind: 12km/h NW', type: 'info' },
] as const;

export const MAP_TILES = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
};

export const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';