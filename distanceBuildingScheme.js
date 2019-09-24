const fs = require('fs');
const util = require('util');
const moment = require('moment');

const readFile = util.promisify(fs.readFile);

changeFareDetails();

function changeFareDetails (){

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

    function handleData(StationDetails, fareDetails){
        let newData = {};
        let mandarinCode = null;
        let currentNode = null;
        for (let i = 0; i < fareDetails.length; i++){
            if (currentNode === null || currentNode !== fareDetails[i].startStaCode){
                if (fareDetails[i].startStaCode !== "1001"){
                    currentNode = fareDetails[i].startStaCode;
                    mandarinCode = findRightCodeForTRaWebsiteCode(StationDetails, currentNode);
                    newData[mandarinCode] = [];
                }
            }
            let endCode = fareDetails[i].endStaCode;
            if (endCode !== "1001"){
                newData[mandarinCode].push({
                    endStaCode: findRightCodeForTRaWebsiteCode(StationDetails, fareDetails[i].endStaCode),
                    mileage: fareDetails[i].mileage
                })
            }
        }
        exportNewData(JSON.stringify(newData));
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