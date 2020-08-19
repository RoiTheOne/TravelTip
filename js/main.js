console.log('Main!');

import { locService } from './services/loc.service.js'
import { mapService } from './services/map.service.js'
var gMap;
var gCurPos = {}


locService.getLocs()
    .then(locs => console.log('locs', locs))

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams){
        gCurPos.lan = urlParams.get('lan');
        gCurPos.lng = urlParams.get('lng');
        console.log(gCurPos,'yeah man');
    }

    initMap()
        .then(() => {
            addMarker({ lat: 32.0749831, lng: 34.9120554 })
            addListeners()
        })

        .catch(console.log('INIT MAP ERROR'))

    locService.getPosition()
        .then(pos => {

            console.log('User position is:', pos.coords);
        })
        .catch(err => {
            console.log('Cannot get user-position', err);
        })
}

document.querySelector('.btn').addEventListener('click', (ev) => {
    console.log('Aha!', ev.target);
    panTo(35.6895, 139.6917);
})

export function initMap(lat = 32.0749831, lng = 34.9120554) {
    return mapService.connectGoogleApi()
        .then(() => {
            gMap = new google.maps.Map(
                document.querySelector('#map'), {
                center: { lat, lng },
                zoom: 15
            })
        })
}

function addMarker(loc) {
    var marker = new google.maps.Marker({
        position: loc,
        map: gMap,
        title: 'Hello World!'
    });
    return marker;
}

function panTo(lat, lng) {
    var laLatLng = new google.maps.LatLng(lat, lng);
    gMap.panTo(laLatLng);
}

function onGetClickedPos(ev) {
    const elModal = document.querySelector('.location-name-modal')
    elModal.hidden = false;
    gCurPos.lat = ev.latLng.lat();
    gCurPos.lng = ev.latLng.lng();
}

function onSavePos() {
    console.log('hiii');
    const elName = document.querySelector('.location-name-input')
    locService.createLocation(gCurPos.lat, gCurPos.lng, Date.now(), elName.value);
    renderTable()
    hideLocationModal()
}

function addListeners() {
    gMap.addListener('click', onGetClickedPos)
    const elModal = document.querySelector('.location-name-modal button')
    elModal.onclick = onSavePos;
    const elSearch = document.querySelector('.search-location button')
    elSearch.addEventListener('click', onSubmitSearch)
    const elCopy = document.querySelector('.copy-location')
    elCopy.addEventListener('click', onCopyLink)

}

function onCopyLink(){
    console.log('hiii');
   const url = `https://roitheone.github.io/TravelTip/?lat=${gCurPos.lat}&lng=${gCurPos.lng}`
   console.log(url);


}


function onSubmitSearch(ev) {
    ev.preventDefault();
    const elInput = document.querySelector('.search-input')
    searchLoc(elInput.value)
        .then(res => {
            gCurPos.lat = res.geometry.location.lat();
            gCurPos.lng = res.geometry.location.lng();
            panTo(gCurPos.lat,gCurPos.lng )
            elInput.value = ''
            renderLocationName(res.formatted_address)
        })
}
function searchLoc(att) {
    var res;
    var geocoder = new google.maps.Geocoder
    return new Promise((resolve, reject) => {
        geocoder.geocode({ 'address': att }, (results, status) => {
            if (status == 'OK') {
                resolve(results[0])

            } else {
                reject(alert('Geocode was not successful for the following reason: ' + status));
            }
        })
    })
}


function renderTable(locations) {
    var locations = locService.getLocations();
    if (!locations || locations.length === 0) {
        document.querySelector('.location-table').innerHTML = 'No items to display'
        return
    }
    var strHTMLs = locations.map((pos) => {
        return `<li class="flex column">
                    <h4 class="location-name">${pos.id} - ${pos.name} </h4>
                    <p class="location-position" data-lat="${pos.lat}" data-lng="${pos.lng}" > lat:${pos.lat}, lng:${pos.lng}</p>
                    <button class="delete-location" data-id="${pos.id}">X</button>
                    <button class="goto-location" data-id="${pos.id}">Go</button>
                    </li>`
    })
    document.querySelector('.location-table').innerHTML = strHTMLs.join('')
}

function hideLocationModal() {
    document.querySelector('.location-name-input').value = ''
    document.querySelector('.location-name-modal').hidden = true;

}

function renderLocationName(name) {
    document.querySelector('.current-location').innerText = name;
}
