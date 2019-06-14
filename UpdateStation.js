const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

function exportNewData(fileName, newData) {
    fs.writeFile(fileName, JSON.stringify(newData), err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    })
}

function removeTheWordStationFromTheTitle() {
    async function getStuff() {
        return await readFile('station.json');
    }

    getStuff().then(data => {
        data = JSON.parse(data);
        data.features = data.features.map(function (el) {
            el.properties.站名 = el.properties.站名.replace('站', '');
            return el;
        });
        exportNewData('station.json', data);
    });
}

mergeTRAStationCodesAndStationJson();

function mergeTRAStationCodesAndStationJson() {

    async function getStation() {
        return await readFile('station.json');
    }

    async function getTRAStationCodes() {
        return await readFile('TRAStationCodes.json');
    }

    getStation().then(stationData => {
        getTRAStationCodes().then(TRAData => {
            stationData = JSON.parse(stationData);
            TRAData = JSON.parse(TRAData);
            stationData.features = stationData.features.map(function (el) {
                let index = TRAData.stations.findIndex(function (traEl) {
                    return traEl.站名 === el.properties.站名
                });
                if (index !== -1) {
                    el.properties.traWebsiteCode = TRAData.stations[index].traWebsiteCode;
                    el.properties.eng站名 = TRAData.stations[index].eng站名;
                }
                return el;
            });
            exportNewData('stationsWithEnglishNames.json', stationData);
        });
    });
}

createStationData();
function createStationData() {

    async function getTRAStations() {
        return await readFile('stationsWithEnglishNames.json');
    }

    getTRAStations().then(stationData => {
       let newStationData = [];
       stationData = JSON.parse(stationData);
       stationData.features.forEach(function (el) {
           newStationData.push({
               "時刻表編號": el.properties.時刻表編號,
               "traWebsiteCode": el.properties.traWebsiteCode,
               "站名": el.properties.站名,
               "eng站名": el.properties.eng站名
           })
       });
        exportNewData('./docs/stationInfo.json', newStationData);
    });
}

// checkTRAStationcodesForMissingEnglishNames();
// checkStationWithEnglishNamesForMissingTraWebsiteCode();

function checkTRAStationcodesForMissingEnglishNames() {

    async function getTRAStationCodes() {
        return await readFile('TRAStationCodes.json');
    }

    getTRAStationCodes().then(TRAData => {
        TRAData = JSON.parse(TRAData);
        let newObject = [];
        TRAData.stations.forEach(function (el) {
            if (!(el.hasOwnProperty("eng站名"))) {
                newObject.push(el);
            }
        });
        exportNewData('TRAStationCodesFalse.json', newObject);
    });
}

function checkStationWithEnglishNamesForMissingTraWebsiteCode() {

    async function getTRAStationCodes() {
        return await readFile('stationsWithEnglishNames.json');
    }

    getTRAStationCodes().then(data => {
        data = JSON.parse(data);
        let newObject = [];
        data.features.forEach(function (el) {
            if (!(el.properties.hasOwnProperty("traWebsiteCode"))) {
                newObject.push(el);
            }
        });
        exportNewData('stationsWithEnglishNamesFalse.json', newObject);
    });
}