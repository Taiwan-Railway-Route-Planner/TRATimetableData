const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

const path = "./docs/routes/";
const destPath = "./docs/Schedules/";

function readStationInfoFile() {

    async function getJsonFile() {
        return await readFile("./docs/stationInfo.json");
    }

    getJsonFile().then(stationInfo => {
        readDir(JSON.parse(stationInfo));
    })
}

function readDir(stationInfo) {

    fs.readdir(path, function(err, items) {

        for (let i=0; i<items.length; i++) {
            readJsonFile(items[i],stationInfo);
        }
    });
}

function readJsonFile(fileName,stationInfo) {

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    async function getJsonFile() {
        return await readFile(path + fileName);
    }

    getJsonFile().then(jsonData => {
        alternateData(JSON.parse(jsonData));
    });

    function alternateData(fileData) {
        fileData.TrainInfos.map(function (el) {
            el.StartStation = parseInt(el.TimeInfos[0].Station);
            el.StartTime = el.TimeInfos[0].DepTime;
            el.EndStation = parseInt(el.TimeInfos[el.TimeInfos.length-1].Station);
            el.EndTime = el.TimeInfos[el.TimeInfos.length-1].DepTime;
            el.Stations = {};
            el.Routes = [];
            el.TimeInfos.forEach(function (tel, index) {
                let routes = stationInfo.stations.find((sel => sel.時刻表編號 === parseInt(tel.Station))).routeCode;
                el.Routes = el.Routes.concat(routes);
                el.Stations[parseInt(tel.Station)] = {
                    "routeCode": routes,
                    "index": index
                };
            });
            el.Routes = el.Routes.filter(onlyUnique);
            el.MultiRoute = el.Routes.length !== 1;
            return el;
        });
        exportNewData(JSON.stringify(fileData));
    }

    function exportNewData(newData){
        fs.writeFile(destPath + fileName, newData, err => {
            if (err) {
                console.log('Error writing file', err)
            } else {
                console.log('Successfully wrote file')
            }
        })
    }
}

readStationInfoFile();
