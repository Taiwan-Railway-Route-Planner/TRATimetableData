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

// removeTheWordStationFromTheTitle();

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

// mergeTRAStationCodesAndStationJson();

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
        let newStationData = {
                "routeInfo": [
                    {
                        "name": "RoundLine",
                        "code": 1,
                    },
                    {
                        "name": "CoastLine",
                        "code": 2,
                    },
                    {
                        "name": "PingxiLine",
                        "code": 3,
                    },
                    {
                        "name": "NiewanLiujaLine",
                        "code": 4,
                    },
                    {
                        "name": "NiewanLine",
                        "code": 5,
                    },
                    {
                        "name": "JijiLine",
                        "code": 6,
                    },
                    {
                        "name": "ShalunLine",
                        "code": 7,
                    }

                ],
                "stations": [],
            };
        stationData = JSON.parse(stationData);
        stationData.features.forEach(function (el) {
            newStationData.stations.push({
                "時刻表編號": parseInt(el.properties.時刻表編號),
                "traWebsiteCode": el.properties.traWebsiteCode,
                "站名": el.properties.站名,
                "eng站名": el.properties.eng站名,
                "routeCode": getTheRightTrainLine(parseInt(el.properties.traWebsiteCode))
            })
        });
        exportNewData('./docs/stationInfo.json', newStationData);
    });
    
    
    function getTheRightTrainLine(traWebsiteCode) {
        let trainRouteCode = [];
        if (traWebsiteCode <= 9999 && traWebsiteCode >= 0
            && !(traWebsiteCode < 1210 && traWebsiteCode > 1190)
            && !(traWebsiteCode < 3446 && traWebsiteCode > 3430)
            && !(traWebsiteCode < 4272 && traWebsiteCode > 4270)
            && !(traWebsiteCode < 7336 && traWebsiteCode > 7330)
            && !(traWebsiteCode < 2260 && traWebsiteCode > 2110)
        ){
            trainRouteCode.push(1);
        }
        if (traWebsiteCode <= 2260 && traWebsiteCode >= 2110 || traWebsiteCode === 1250){
            trainRouteCode.push(2);
        }
        if (traWebsiteCode <= 7336 && traWebsiteCode >= 7330){
            trainRouteCode.push(3);
        }
        if (traWebsiteCode <= 1210 && traWebsiteCode >= 1190){
            trainRouteCode.push(4);
        }
        if (traWebsiteCode <= 1208 && traWebsiteCode >= 1201 || traWebsiteCode === 1193){
            trainRouteCode.push(5);
        }
        if (traWebsiteCode <= 3446 && traWebsiteCode >= 3430){
            trainRouteCode.push(6);
        }
        if (traWebsiteCode <= 4272 && traWebsiteCode >= 4270){
            trainRouteCode.push(7);
        }
        return trainRouteCode;
    }
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

// CreateDifferentJsonLineFiles();

function CreateDifferentJsonLineFiles() {

    async function getUpdatedStationInfo() {
        return await readFile('./docs/stationInfo.json');
    }

    getUpdatedStationInfo().then(data => {
        data = JSON.parse(data);
        let RoundLine = [];
        let CoastLine = [];
        let PingxiLine = [];
        let NiewanLiujaLine = [];
        let NiewanLine = [];
        let JijiLine = [];
        let ShalunLine = [];
        data.stations.forEach(function (el) {
            if (el.routeCode.includes(1)){
                RoundLine.push(el);
            }
            if (el.routeCode.includes(2)){
                CoastLine.push(el);
            }
            if (el.routeCode.includes(3)){
                PingxiLine.push(el);
            }
            if (el.routeCode.includes(4)){
                NiewanLiujaLine.push(el);
            }
            if (el.routeCode.includes(5)){
                NiewanLine.push(el);
            }
            if (el.routeCode.includes(6)){
                JijiLine.push(el);
            }
            if (el.routeCode.includes(7)){
                ShalunLine.push(el);
            }
        });
        exportNewData('./docs/Lines/RoundLine.json', RoundLine);
        exportNewData('./docs/Lines/CoastLine.json', CoastLine);
        exportNewData('./docs/Lines/PingxiLine.json', PingxiLine);
        exportNewData('./docs/Lines/NiewanLiujaLine.json', NiewanLiujaLine);
        exportNewData('./docs/Lines/NiewanLine.json', NiewanLine);
        exportNewData('./docs/Lines/JijiLine.json', JijiLine);
        exportNewData('./docs/Lines/ShalunLine.json', ShalunLine);
    });
}

sortRoundLine();

function sortRoundLine() {

    async function readRoundLine() {
        return await readFile('./docs/Lines/RoundLine.json');
    }

    readRoundLine().then(data => {
        data = JSON.parse(data);
        data.sort(function(a, b) {
            return parseInt(a.traWebsiteCode) - parseInt(b.traWebsiteCode);
        });
        exportNewData('./docs/Lines/RoundLine.json', data);
    });
}