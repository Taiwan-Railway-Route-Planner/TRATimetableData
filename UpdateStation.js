const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

const path = "./docs/routes/";
let stationInfo = null;

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
                        "name": "NeiwanLiujaLine",
                        "code": 4,
                    },
                    {
                        "name": "NeiwanLine",
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
                "routeCode": getTheRightTrainLine(parseInt(el.properties.traWebsiteCode)),
                "gradeStation": getGradeStationInformation(parseInt(el.properties.traWebsiteCode))
            })
        });
        loadAllTheNeededFiles(newStationData);
    });
    
    function getTheRightTrainLine(traWebsiteCode) {
        let trainRouteCode = [];
        if (traWebsiteCode <= 9999 && traWebsiteCode >= 0
            && !(traWebsiteCode < 1210 && traWebsiteCode > 1190)
            && !(traWebsiteCode <= 3436 && traWebsiteCode > 3430)
            && !(traWebsiteCode <= 4272 && traWebsiteCode > 4270)
            && !(traWebsiteCode <= 7336 && traWebsiteCode > 7330)
            && !(traWebsiteCode <= 2260 && traWebsiteCode >= 2110)
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
        if (traWebsiteCode <= 3436 && traWebsiteCode >= 3420){
            trainRouteCode.push(6);
        }
        if (traWebsiteCode <= 4272 && traWebsiteCode >= 4270){
            trainRouteCode.push(7);
        }
        return trainRouteCode;
    }

    function getGradeStationInformation(traWebsiteCode) {
        switch (traWebsiteCode) {
            case 1000:
            case 3300:
            case 4400:
            case 7000:
                return {
                    "status": true,
                    "value": 0
                };
            case 1010:
            case 1020:
            case 1040:
            case 1080:
            case 1100:
            case 1210:
            case 1250:
            case 3160:
            case 3230:
            case 3360:
            case 3390:
            case 3470:
            case 4080:
            case 4120:
            case 4420:
            case 4310:
            case 4340:
            case 5000:
            case 5050:
            case 6000:
            case 6110:
            case 7130:
            case 7190:
            case 7360:
            case 930:
            case 900:
            case 980:
            case 990:
                return {
                    "status": true,
                    "value": 1
                };
            case 1070:
            case 1203:
            case 2200:
            case 2230:
            case 2240:
            case 3420:
            case 3430:
            case 3480:
            case 4150:
            case 4170:
            case 4200:
            case 4270:
            case 4330:
            case 4440:
            case 7030:
            case 7060:
            case 7100:
            case 7120:
            case 7150:
            case 7160:
            case 7310:
            case 910:
            case 960:
                return {
                    "status": true,
                    "value": 1
                };
            default:
                return {
                    "status": false,
                    "value": null
                };
        }
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

// sortRoundLine();

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

function loadAllTheNeededFiles(newStationData) {

    readDir();

    function readDir() {
        stationInfo = newStationData;
        stationInfo.stations = resetStationInfo(stationInfo);

        fs.readdir(path, function (err, items) {

            for (let i = 0; i < items.length; i++) {
                countTheNumberOfStopsPerStation(items[i]);
            }

            setTimeout(checkTheData, 15000, items.length);
        });
    }

    function resetStationInfo(infoAboutStations) {
        return infoAboutStations.stations.map(function (el) {
            el.stops = 0;
            return el;
        })
    }
}

function countTheNumberOfStopsPerStation(fileName) {

    async function getJsonFile() {
        return await readFile(path + fileName);
    }

    getJsonFile().then(jsonData => {
        iterateOverTrainRouteStops(JSON.parse(jsonData));
    });

    function iterateOverTrainRouteStops(trainStopRoute) {
        trainStopRoute.TrainInfos.forEach(function (el) {
            el.TimeInfos.forEach(function (element) {
                let index = stationInfo.stations.findIndex((sel => sel.時刻表編號 === parseInt(element.Station)));
                stationInfo.stations[index].stops++;
            })
        });
    }
}

function checkTheData(lengthOfItems) {

    nowMakeTheStopsAverageBasedOnTheNumberOfFiles();

    function nowMakeTheStopsAverageBasedOnTheNumberOfFiles() {
        stationInfo.stations = stationInfo.stations.map(function (el) {
            el.stops = Math.round(parseInt(el.stops) / lengthOfItems);
            return el;
        });
        exportNewData("./docs/stationInfo.json", stationInfo);
        updateDifferentLineData(stationInfo);
    }
}

const linePath = './docs/Lines/';
const differentLines = [
    'RoundLine',
    'CoastLine',
    'PingxiLine',
    'NeiwanLiujaLine',
    'NeiwanLine',
    'JijiLine',
    'ShalunLine'
];

let counter = 0;

function updateDifferentLineData(stationInfo) {

    async function getJsonFile() {
        console.log("Reading file: ", differentLines[counter]+".json");
        return await readFile(linePath + differentLines[counter] + ".json");
    }

    getJsonFile().then(lineData => {
        addStopsAndGradeStationCodeTo(JSON.parse(lineData));
    });

    function addStopsAndGradeStationCodeTo(lineData) {
        lineData = lineData.map(function (el) {
            let stationInfoMatch = stationInfo.stations.find((element => element.時刻表編號 === parseInt(el.時刻表編號)));
            el.stops = stationInfoMatch.stops;
            el.gradeStation = stationInfoMatch.gradeStation;
            return el;
        });
        console.log("Saving file: ", differentLines[counter]+".json");
        exportNewData(linePath + differentLines[counter] + ".json", lineData);
        counter++;
        if (counter < differentLines.length){
            updateDifferentLineData(stationInfo);
        } else {
            console.log("Done with everything!!");
            console.log("*****************************************");
        }

    }
}