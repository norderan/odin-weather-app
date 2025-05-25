import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


const map = L.map('map', {
  zoomControl: false // disable default position
}).setView([51.505, -0.09], 13);

// add zoom control manually in a new position
L.control.zoom({
  position: 'bottomright' // or 'topright', 'bottomleft', 'topleft'
}).addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 19,
attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);



function setMapCoordinates(coordinates) {
    map.setView([coordinates.lat, coordinates.lon], 10);
}


export { setMapCoordinates, map };