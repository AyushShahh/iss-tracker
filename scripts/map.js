var mymap = L.map('map');

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'Mapbox_API_access_token'
}).addTo(mymap);

var issIcon = L.icon({
    iconUrl: '/assets/icons/ISS.png',
    iconSize: [40, 40]
});

var bermuda_tri = L.polygon([
    [32.3078, -64.7505],
    [25.7617, -80.1918],
    [18.4655, -66.1057]
], {
    color: '#f03',
    opacity: 0.1,
    fillColor: '#f03',
    fillOpacity: 0.2
}).addTo(mymap);

var area51 = L.circle([37.2489,-115.8333], {
    color: 'red',
    opacity: 0.65,
    fillColor: '#f03',
    fillOpacity: 0.3,
    radius: 5700
}).addTo(mymap);

bermuda_tri.bindPopup("Bermuda Triangle");
area51.bindPopup("Area 51");

var ISS = L.marker([0,0], {icon: issIcon}).addTo(mymap);

const iss_url = 'https://api.wheretheiss.at/v1/satellites/25544';

mymap.setZoom(3);
let first_load = true;

async function fetchISSloc(){
    const response = await fetch(iss_url);
    const {latitude,longitude} = await response.json();

    ISS.setLatLng([latitude,longitude]);

    if(first_load){
        mymap.setView([latitude,longitude]);
        first_load = false;
    }
}

function setview(){
    first_load = true;
}

setInterval(fetchISSloc,1500);
setInterval(setview,150000);