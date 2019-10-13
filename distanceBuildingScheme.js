const fs = require('fs');
const util = require('util');
const moment = require('moment');

const readFile = util.promisify(fs.readFile);

changeFareDetails();

function changeFareDetails() {

    async function getJsonFile() {
        return await readFile("WK-fare.json");
    }


    async function getStationInfo() {
        return await readFile("./docs/stationInfo.json");
    }

    getJsonFile().then(fareDetails => {
        getStationInfo().then(StationDetails => {
            handleData(JSON.parse(StationDetails), JSON.parse(fareDetails))
        });
    });

    function handleData(StationDetails, fareDetails) {
        let newData = {};
        let mandarinCode = null;
        let currentNode = null;
        for (let i = 0; i < fareDetails.length; i++) {
            if (currentNode === null || currentNode !== fareDetails[i].startStaCode) {
                if (fareDetails[i].startStaCode !== "1001") {
                    currentNode = fareDetails[i].startStaCode;
                    mandarinCode = findRightCodeForTRaWebsiteCode(StationDetails, currentNode);
                    newData[mandarinCode] = [];
                }
            }
            let endCode = fareDetails[i].endStaCode;
            if (endCode !== "1001") {
                newData[mandarinCode].push({
                    endStaCode: findRightCodeForTRaWebsiteCode(StationDetails, fareDetails[i].endStaCode),
                    mileage: fareDetails[i].mileage
                })
            }
        }

        exportNewData(JSON.stringify(makeUnique(newData)));
    }

    function makeUnique(newData) {
        Object.keys(newData).forEach(function ($el) {
            newData[$el] = (Object.values(newData[$el].reduce((unique, o) => {
                if (!unique[o.endStaCode] || +o.mileage < +unique[o.endStaCode].mileage) unique[o.endStaCode] = o;

                return unique;
            }, {})));
        });
        return modifyFareList(newData);
    }

    function modifyFareList(fareData) {
        fareData = Object.keys(fareData).map(function (el) {
            let newObject = {};
            fareData[el].forEach(function (element) {
                newObject[element.endStaCode] = {mileage: element.mileage};
            });
            return {[el]: newObject};
        });
        let newFareDetails = {};
        Object.keys(fareData).forEach(function (el) {
            newFareDetails[Object.keys(fareData[el])[0]] = fareData[el][Object.keys(fareData[el])[0]];
        });
        return newFareDetails;
    }

    function findRightCodeForTRaWebsiteCode(StationDetails, traWebsiteCode) {
        return StationDetails.stations.find((el => el.traWebsiteCode === traWebsiteCode)).時刻表編號;
    }
}


function exportNewData(newData) {
    fs.writeFile(('fare.json'), newData, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    })
}