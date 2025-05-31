import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


let map = L.map('map', {
  zoomControl: false // disable default position
}).setView([51.505, -0.09], 13); // london coordinates

// add zoom control manually in a new position
L.control.zoom({
  position: 'bottomright' // or 'topright', 'bottomleft', 'topleft'
}).addTo(map);

let currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function switchTileLayer() {
  if (currentTileLayer) {
    map.removeLayer(currentTileLayer);
  }
  if (currentTileLayer && currentTileLayer.options.attribution === '&copy; Stamen Design') {
    // Switch to normal
    currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  } else {
    // Switch to dark
    currentTileLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}?api_key=5a75efd9-337a-4f8a-960f-814a5351722e', {
      minZoom: 0,
      maxZoom: 20,
      attribution: '&copy; Stamen Design',
      ext: 'png'
    }).addTo(map);
  }
  }


function setMapCoordinates(coordinates) {
    map.setView([coordinates.lat, coordinates.lon], 10);
}


export { setMapCoordinates, map, switchTileLayer };