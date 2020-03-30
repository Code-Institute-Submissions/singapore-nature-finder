let map = L.map("map-container").setView([1.3138,103.8159],12)

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw' //demo access token
}).addTo(map);

let treeIcon = L.icon({
    iconUrl: '../images/tree_icon.png',
    iconSize: [32, 60],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    shadowUrl: '../images/tree_icon_shadow.png',
    shadowSize: [65, 43],
    shadowAnchor: [22, 72]
});