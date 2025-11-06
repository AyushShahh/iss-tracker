let mymap = L.map('map');
var t = L.terminator();
t.addTo(mymap);

setInterval(function(){updateTerminator(t)}, 500);
function updateTerminator(t) {
  t.setTime();
}

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-streets-v12',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'Mapbox_API_access_token'
}).addTo(mymap);

let issIcon = L.icon({
    iconUrl: '/assets/icons/ISS.png',
    iconSize: [60, 60]
});

let r = L.polyline([], {color: '#ccff23ff', opacity: 0.67}).addTo(mymap);

async function route(timestamp) {
    let api = 'https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=';

    let i = 2;
    let check = false;
    let points = [], temp = [];
    while (i--) {
        let timestamps = '';
        for (let i = timestamp-3000; i <= timestamp; i+=70) {
            timestamps += i + ',';
        }
        timestamps = timestamps.slice(0, -1);

        let response = await fetch(api+timestamps);
        response = await response.json();

        for (let {latitude, longitude} of response) {
            if (!check && longitude >= 170) check = true;
            else if (check && longitude <= -170) {
                points.push(temp);
                temp = [];
                check = false;
            }
            temp.push([latitude, longitude]);
        }
        timestamp += 3000;
        setTimeout(() => {}, 1000);
    }
    points.push(temp);
    r.setLatLngs(points);
}

let bermuda_tri = L.polygon([
    [32.3078, -64.7505],
    [25.7617, -80.1918],
    [18.4655, -66.1057]
], {
    color: '#f03',
    opacity: 0.1,
    fillColor: '#f03',
    fillOpacity: 0.2
}).addTo(mymap);

let area51 = L.circle([37.2489,-115.8333], {
    color: 'red',
    opacity: 0.65,
    fillColor: '#f03',
    fillOpacity: 0.3,
    radius: 5700
}).addTo(mymap);

bermuda_tri.bindPopup("Bermuda Triangle");
area51.bindPopup("Area 51");

let ISS = L.marker([0,0], {icon: issIcon}).addTo(mymap);

const iss_url = 'https://api.wheretheiss.at/v1/satellites/25544';
const country_iss = 'https://api.wheretheiss.at/v1/coordinates/';

mymap.setZoom(3);
let first_load = true, showRoute = true;

function setRoute() {
    showRoute = true;
}

let countries = fetch('/assets/countries.json').then(response => response.json());

let lati = document.getElementById('lat');
let longi = document.getElementById('lon');
let alt = document.getElementById('alt');
let vel = document.getElementById('vel');
let vis = document.getElementById('visibility');
let country = document.getElementById('country');
let follow = document.getElementById('follow-iss');


follow.addEventListener('change', () => {
    if (follow.checked) {
        first_load = true;
    }
    else {
        first_load = false;
    }
})


async function fetchISSloc(){
    const response = await fetch(iss_url);
    const {latitude,longitude,velocity,altitude,visibility,timestamp} = await response.json();

    ISS.setLatLng([latitude,longitude]);

    lati.innerHTML = latitude;
    longi.innerHTML = longitude;
    alt.innerHTML = altitude.toFixed(2) + " kilometers";
    vel.innerHTML = velocity.toFixed(2) + " km/h";
    vis.innerHTML = `The ISS is in ${visibility == "daylight" ? "Daylight" : "Earth's Shadow"}`;

    const country_response = await fetch(country_iss + latitude + ',' + longitude);
    const {country_code} = await country_response.json();
    const countries_data = await countries;

    country.innerHTML = `The ISS is over the ${(country_code != '??') ? `${countries_data[country_code]}` : "Ocean"}`;

    if(first_load){
        mymap.setView([latitude,longitude]);
    }

    if (showRoute) {
        route(timestamp);
        showRoute = false;
    }
}

setInterval(fetchISSloc,1000);
setInterval(setRoute, 1000*230);