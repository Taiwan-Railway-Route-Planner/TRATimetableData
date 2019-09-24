const fs = require('fs');
const util = require('util');
const moment = require('moment');

const readFile = util.promisify(fs.readFile);

changeFareDetails();

function changeFareDetails (){

    async function getJsonFile() {
        return await readFile("WK-fare.json");
    }

    getJsonFile().then(jsonData => {
        handleData(JSON.parse(jsonData));
    })

    function handleData(data){
        let newData = {};
        let currentStartCode = null;
        for (let i = 0; i < data.length; i++){
            if (currentStartCode === null || currentStartCode != data[i].startStaCode){
                currentStartCode = data[i].startStaCode;
                newData[currentStartCode] = [];
            }
            newData[currentStartCode].push({
                endStaCode: data[i].endStaCode,
                milage: data[i].mileage
            })
        }
        exportNewData(JSON.stringify(newData));
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