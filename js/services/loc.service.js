import { storageService } from './storage.service.js'
import { utils } from './utlis.js'


export const locService = {
    getLocs,
    createLocation,
    getLocations,
    deleteLocation,
    findLocation
}

const KEY = 'LOCATIONS';
var gNextId;

var gLocations = [];
var locs = [{ lat: 11.22, lng: 22.11 }]

function getLocs() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(locs);
        }, 2000)
    });
}

function createLocation(lat, lng, createdAt, name) {
    if (!gLocations.length) gNextId = 100;
    else gNextId = gLocations[gLocations.length - 1].id + 1;
    const location = {
        id: gNextId++,
        lat,
        lng,
        createdAt,
        name
    }
    gLocations.push(location)
    storageService.saveToStorage(KEY, gLocations)
    return location
}

function getLocations() {
    if (!gLocations.length) gLocations = storageService.loadFromStorage(KEY)
    return gLocations;
}

function deleteLocation(locationId) {
    var locationIdx = utils.findIdxById(locationId, gLocations);
    gLocations.splice(locationIdx, 1)
    storageService.saveToStorage(KEY, gLocations)
}


function findLocation(id) {
    const locationIdx = utils.findIdxById(id, gLocations);;
    let lat = gLocations[locationIdx].lat
    let lng = gLocations[locationIdx].lng

    return { lat, lng }
}