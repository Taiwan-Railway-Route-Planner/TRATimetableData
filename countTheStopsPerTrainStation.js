const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

const path = "./docs/routes/";
let stationInfo = null;

loadAllTheNeededFiles();

function loadAllTheNeededFiles() {

    async function getStationInfo() {
        return await readFile('./docs/stationInfo.json');
    }

    getStationInfo().then(data => {
        readDir(JSON.parse(data));
    });

    function readDir(infoAboutStations) {
        stationInfo = infoAboutStations;
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
            // if (el.stops  === undefined){
                el.stops = 0;
            // } else {
            //     el.stops = 0;
            // }
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
                // console.log("index", index);
                // if (stationInfo.stations[index].stops  === undefined){
                //     stationInfo.stations[index].stops = 0;
                // } else {
                    stationInfo.stations[index].stops++;
                // }
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
        exportChangedStationInfo(stationInfo);
    }

    function exportChangedStationInfo(newData) {
        fs.writeFile("./docs/stationInfo.json", JSON.stringify(newData), err => {
            if (err) {
                console.log('Error writing file', err)
            } else {
                console.log('Successfully wrote file')
            }
        });
    }
}