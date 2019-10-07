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

function alternateDataSoWeHaveCounties() {

    async function getStuff() {
        return await readFile('車站基本資料集.json');
    }

    getStuff().then(data => {
        data = JSON.parse(data);
        data.features = data.map(function (el) {
            el.縣市 = el.stationAddrTw.split(' ')[0];
            el.eng縣市 = el.stationAddrEn.split(/\s\s\s|\s\s/)[1];
            return el;
        });
        exportNewData('車站基本資料集.json', data);
    });
}

function updateStationInfoWithCounty() {

    async function getStationInfoInDocsDir() {
        return await readFile('./docs/stationInfo.json');
    }

    async function getStationInformation() {
        return await readFile('車站基本資料集.json');
    }

    getStationInfoInDocsDir().then(stationData => {
        getStationInformation().then(stationInformation => {
            stationData = JSON.parse(stationData);
            stationInformation = JSON.parse(stationInformation);
            stationData.stations = stationData.stations.map(function (el) {
                let index = stationInformation.findIndex(function (traEl) {
                    return traEl.stationCode === el.traWebsiteCode
                });
                if (index !== -1) {
                    el.縣市 = stationInformation[index].縣市;
                    el.eng縣市 = stationInformation[index].eng縣市;
                } else {
                    console.log(el.traWebsiteCode);
                }
                return el;
            });
            getUniqueList(stationData);
        });
    });
}

function getUniqueList(stationData) {
    let counties = [];
    const newPlaces = stationData.stations.filter((thing, index, self) =>
        index === self.findIndex((t) => (
            t.縣市 === thing.縣市 && t.eng縣市 === thing.eng縣市
        ))
    );
    counties = newPlaces.map(function (el) {
        return {
            縣市: el.縣市,
            eng縣市: el.eng縣市
        }
    });
    stationData.counties = counties;
    exportNewData('./docs/stationInfo.json', stationData);
}

// alternateDataSoWeHaveCounties();
updateStationInfoWithCounty();