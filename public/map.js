let cityMap = {
    // West Coast
    "los-angeles": [34.0522, -118.2437],
    "san-diego": [32.7157, -117.1611],
    "san-francisco": [37.7749, -122.4194],
    "santa-rosa": [38.4404, -122.7141],
    "san-jose": [37.3382, -121.8863],
    "seattle": [47.6062, -122.3321],
    "portland": [45.5155, -122.6789],
    "sacramento": [38.5816, -121.4944],
    "oakland": [37.8044, -122.2712],
    "long-beach": [33.7701, -118.1937],
    "anaheim": [33.8366, -117.9143],

    // Central US
    "chicago": [41.8781, -87.6298],
    "detroit": [42.3314, -83.0458],
    "minneapolis": [44.9778, -93.2650],
    "cleveland": [41.4993, -81.6944],
    "omaha": [41.2565, -95.9345],
    "st-louis": [38.6270, -90.1994],
    "indianapolis": [39.7684, -86.1581],
    "columbus": [39.9612, -82.9988],
    "milwaukee": [43.0389, -87.9065],
    "kansas-city": [39.0997, -94.5786],
    "cincinnati": [39.1031, -84.5120],

    // East Coast
    "new-york-city": [40.7128, -74.0060],
    "boston": [42.3601, -71.0589],
    "philadelphia": [39.9526, -75.1652],
    "washington-dc": [38.9072, -77.0369],
    "miami": [25.7617, -80.1918],
    "baltimore": [39.2904, -76.6122],
    "newark": [40.7357, -74.1724],
    "providence": [41.8240, -71.4128],
    "atlanta": [33.7490, -84.3880],
    "tampa": [27.9506, -82.4572]
};


export const cityCoordinates = {
    // West Coast
    'Los Angeles': [34.0522, -118.2437],
    'San Diego': [32.7157, -117.1611],
    'San Francisco': [37.7749, -122.4194],
    'Santa Rosa': [38.4404, -122.7141],
    'San Jose': [37.3382, -121.8863],
    'Seattle': [47.6062, -122.3321],
    'Portland': [45.5155, -122.6789],
    'Sacramento': [38.5816, -121.4944],
    'Oakland': [37.8044, -122.2712],
    'Long Beach': [33.7701, -118.1937],
    'Anaheim': [33.8366, -117.9143],
    
    // Central US
    'Chicago': [41.8781, -87.6298],
    'Detroit': [42.3314, -83.0458],
    'Minneapolis': [44.9778, -93.2650],
    'Cleveland': [41.4993, -81.6944],
    'Omaha': [41.2565, -95.9345],
    'St. Louis': [38.6270, -90.1994],
    'Indianapolis': [39.7684, -86.1581],
    'Columbus': [39.9612, -82.9988],
    'Milwaukee': [43.0389, -87.9065],
    'Kansas City': [39.0997, -94.5786],
    'Cincinnati': [39.1031, -84.5120],
    
    // East Coast
    'New York City': [40.7128, -74.0060],
    'Boston': [42.3601, -71.0589],
    'Philadelphia': [39.9526, -75.1652],
    'Washington, D.C.': [38.9072, -77.0369],
    'Miami': [25.7617, -80.1918],
    'Baltimore': [39.2904, -76.6122],
    'Newark': [40.7357, -74.1724],
    'Providence': [41.8240, -71.4128],
    'Atlanta': [33.7490, -84.3880],
    'Tampa': [27.9506, -82.4572]
};

const regionViews = {
    'West Coast': { center: [37.7749, -122.4194], zoom: 5 },
    'Central US': { center: [41.8781, -87.6298], zoom: 4 },
    'East Coast': { center: [40.7128, -74.0060], zoom: 5 }
};

let map;

export function initializeMap(elementId) {
    map = L.map(elementId).setView([37.7749, -122.4194], 19);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add click handler
    map.on('click', (e) => {
        L.popup()
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString())
            .openOn(map);
    });

    return map;
}

let polygon
export function initalizeFireReigon() {
    if (map) {
        console.log("Initializing the fire reigon"); //debug
        polygon = L.polygon(
            [
                [37.770918, -122.458205],
                [37.768272, -122.459579],
                [37.768001, -122.453828],
            ],
            { color: 'red' }
        ).addTo(map);
    } else {
        console.error("Map is not initialized. Please initialize the map before adding polygons.");
    }
}




export function updateMapView(map, city = null, region = null) {
    if (city && cityCoordinates[city]) {
        map.setView(cityCoordinates[city], 10);
    } else if (region) {
        const view = regionViews[region] || regionViews['West Coast'];
        map.setView(view.center, view.zoom);
    }
}

/**
 * Generates wildfire expansion by generating an array of polygons
 */
export function generateWildfireData(center, steps = 40, initialSides = 3, maxSides = 20, radiusStep = 0.001) {
    const data = [];
    const [lat, lng] = center;

    for (let t = 0; t < steps; t++) {
        console.log("Generating step: ");
        const sides = Math.min(initialSides + t, maxSides); // gradually increase sides
        const radius = (t + 1) * radiusStep;
        const angleOffset = Math.random() * Math.PI * 2;

        const polygon = [];
        for (let i = 0; i < sides; i++) {
            const angle = angleOffset + (i / sides) * 2 * Math.PI;
            const jitter = (Math.random() - 0.5) * radiusStep * 0.5;
            const latOffset = Math.cos(angle) * (radius + jitter);
            const lngOffset = Math.sin(angle) * (radius + jitter);
            polygon.push([lat + latOffset, lng + lngOffset]);
        }

        data.push(polygon);
    }

    return data;
}


/**
 * Receives a UGC Geo code and returns a representative coordinate (latitude, longitude)
 * for that zone by parsing a NOAA .dbx file.
 *
 * Example usage:
 *   UGCGeocodeToCoords("CAZ006");
 *   // Returns [37.7558, -122.4423]
 *
 * Format of matching line:
 *   STATE|CODE|WFO|ZONE NAME|UGC|COUNTY NAME|FIPS|TYPE|REGION|LAT|LON
 *
 * @param {string} code - A UGC zone code (e.g. "CAZ530")
 * @returns {[number, number] | null} - [latitude, longitude] or null if not found
 */
function UGCGeocodeToCoords(code) {
    const fs = require('fs');

    const state = code.slice(0, 2);   // "CA"
    const zone = code.slice(3);       // "530"
    const dbxLines = fs.readFileSync('bp05mr24.dbx', 'utf-8').split('\n');

    for (const line of dbxLines) {
    const parts = line.trim().split('|');
    if (parts[0] === state && parts[1] === zone) {
        const lat = parseFloat(parts[9]);
        const lon = parseFloat(parts[10]);
        return [lat, lon];
    }
    }

    return null; // not found
}



/**
 * Creates markers on map given coordinates, a message, and the userID/name
 *
 * See ~line 289 for on dashboard.html for example usage
 * 
 * @param {int} expiration - The time in seconds when the marker should be removed
 * NOTE: Ideally, users/mods would delete obsolete markers but for the sake the demo
 * we'll just have them remove themselves after a certain time.
 * @returns {marker} - The actual pin object, but maybe it's not needed
 */
export function createMarker(map, coordinates, text, type = "unknown", user = "anonymous") {
    const marker = L.marker(coordinates).addTo(map);
    marker.bindPopup(`2025-04-04: User ${user} reported event ${type}, [${coordinates[0]},${coordinates[1]}], '${text}'`).openPopup();
    timedMarkerRemove(marker, 8);
    return marker;
}

function timedMarkerRemove(marker, expiration) {
    setTimeout(() => {
        marker.remove();
    }, expiration * Math.floor(Math.random() * (10 - 1 + 1) + 1) * 1000);
}

  
  // Example usage:
  const center = [37.770817, -122.456907]; // SF start point
  //const polygonData = generateWildfireData(center);
    const polygonData = [
        [
            [37.770647, -122.457175],
            [37.769496, -122.458291],
            [37.769021, -122.455716]
        ],
        [
            [37.772277, -122.456746],
            [37.772685, -122.458892],
            [37.768749, -122.459664],
            [37.767732, -122.455115],
            [37.771056, -122.45357]
        ],
        [ // fire spreads through panhandle
            [37.774652, -122.454944],
            [37.774516, -122.458034],
            [37.773024, -122.459493],
            [37.770921, -122.460351],
            [37.768885, -122.45975],
            [37.76685, -122.458119],
            [37.767053, -122.454686],
            [37.770953, -122.453935],
            [37.772039, -122.448699],
            [37.772853, -122.448914],
            [37.77248, -122.454364],
            [37.774888, -122.454879]
        ], 
        [// mostly westward expansion
            [37.772089, -122.454075],
            [37.773124, -122.444934],
            [37.7727, -122.442917],
            [37.77119, -122.45386],
            [37.766543, -122.453023],
            [37.766458, -122.460726],
            [37.768613, -122.463892],
            [37.77136, -122.466209],
            [37.773498, -122.463934],
            [37.773498, -122.463934]
        ],
        [   //fire hits mount sutro
            [37.766306, -122.47256],
            [37.768986, -122.470758],
            [37.768511, -122.467282],
            [37.770444, -122.464364],
            [37.773124, -122.469685],
            [37.77482, -122.454836],
            [37.772276, -122.453892],
            [37.773871, -122.439344],
            [37.773294, -122.439344],
            [37.771326, -122.453721],
            [37.766679, -122.453163],
            [37.762777, -122.45445],
            [37.760945, -122.457325],
            [37.763049, -122.459729],
            [37.766441, -122.459986]
        ]
    ];

/*
let t = 0;
const interval = setInterval(() => {
  if (t >= polygonData.length) return clearInterval(interval);
  polygon.setLatLngs(polygonData[t]);
  t++;
}, 4000);
*/