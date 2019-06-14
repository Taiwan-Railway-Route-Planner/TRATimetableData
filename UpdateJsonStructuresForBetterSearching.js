const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

const path = "./docs/Schedules/";
const alternatedPath = "./docs/ASchedules/";

function readDir() {

    fs.readdir(path, function(err, items) {

        for (let i=0; i<items.length; i++) {
            readJsonFile(items[i]);
        }
    });
}

function readJsonFile(fileName) {

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
            return el;
        });
        exportNewData(JSON.stringify(fileData));
    }

    function exportNewData(newData){
        fs.writeFile(alternatedPath + fileName, newData, err => {
            if (err) {
                console.log('Error writing file', err)
            } else {
                console.log('Successfully wrote file')
            }
        })
    }

}

readDir();



