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

alternateDataSoWeHaveCounties();

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