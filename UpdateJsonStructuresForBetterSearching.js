const fs = require('fs');
const util = require('util');
const moment = require('moment');

const readFile = util.promisify(fs.readFile);

const path = "./docs/routes/";
const destPath = "./docs/Schedules/";
const linePath = "./docs/Lines/";

let Line = {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null
};

// readDirOfLines();

function readDirOfLines() {

    fs.readdir(linePath, function (err, items) {

        for (let i = 0; i < items.length; i++) {
            saveLineInfoInArray(items[i]);
        }
    });
    readStationInfoFile();
}

function saveLineInfoInArray(fileName) {

    async function getJsonFile() {
        return await readFile(linePath + fileName);
    }

    getJsonFile().then(jsonData => {
        save(JSON.parse(jsonData), fileName);
    });

    function save(jsonData, fileName) {
        fileName = fileName.replace('.json', '');
        switch (fileName) {
            case "RoundLine":
                Line["1"] = jsonData;
                break;
            case "CoastLine":
                Line["2"] = jsonData;
                break;
            case "PingxiLine":
                Line["3"] = jsonData;
                break;
            case "NiewanLiujaLine":
                Line["4"] = jsonData;
                break;
            case "NiewanLine":
                Line["5"] = jsonData;
                break;
            case "JijiLine":
                Line["6"] = jsonData;
                break;
            case "ShalunLine":
                Line["7"] = jsonData;
                break;
        }
    }
}

readStationInfoFile();

function readStationInfoFile() {

    async function getJsonFile() {
        return await readFile("./docs/stationInfo.json");
    }

    getJsonFile().then(stationInfo => {
        readDir(JSON.parse(stationInfo));
    });
}

function readDir(stationInfo) {

    fs.readdir(path, function (err, items) {

        for (let i = 0; i < items.length; i++) {
            readJsonFile(items[i], stationInfo);
        }

        setTimeout(addRoutesToStationFromSpecialRoutes, 15000);
    });
}

function readJsonFile(fileName, stationInfo) {

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
            el.StartTime = moment(el.TimeInfos[0].DepTime, 'HH:mm:ss').format('HH:mm');
            el.EndStation = parseInt(el.TimeInfos[el.TimeInfos.length - 1].Station);
            el.EndTime = moment(el.TimeInfos[el.TimeInfos.length - 1].DepTime, 'HH:mm:ss').format('HH:mm');
            el.Stations = {};
            el.Routes = [];
            let MiddleStation = el.TimeInfos[Math.round((el.TimeInfos.length - 1) / 2)].Station;
            let beforeMiddleStation = el.TimeInfos[Math.round(((el.TimeInfos.length - 1) / 2) / 2)].Station;
            let afterMiddleStation = el.TimeInfos[Math.round(((el.TimeInfos.length - 1) / 2) + ((el.TimeInfos.length - 1) / 2) / 2)].Station;
            let newTimeInfo = {};
            let isTaipeiAlreadyAdded = false;
            el.TimeInfos.forEach(function (tel, index) {
                let routes = stationInfo.stations.find((sel => sel.時刻表編號 === parseInt(tel.Station))).routeCode;
                el.Routes = el.Routes.concat(routes);
                if (el.Train === "1" || el.Train === "2"){
                    if (tel.Station === "1008" && isTaipeiAlreadyAdded){
                        newTimeInfo["_" + tel.Station] = {
                            "Station": tel.Station,
                            "Order": tel.Order,
                            "DepTime": moment(tel.DepTime, 'HH:mm:ss').format('HH:mm'),
                            "ArrTime": moment(tel.ArrTime, 'HH:mm:ss').format('HH:mm'),
                            "Routes": routes
                        }
                    } else {
                        newTimeInfo[tel.Station] = {
                            "Station": tel.Station,
                            "Order": tel.Order,
                            "DepTime": moment(tel.DepTime, 'HH:mm:ss').format('HH:mm'),
                            "ArrTime": moment(tel.ArrTime, 'HH:mm:ss').format('HH:mm'),
                            "Routes": routes
                        };
                        isTaipeiAlreadyAdded = true;
                    }
                } else {
                    newTimeInfo[tel.Station] = {
                        "Station": tel.Station,
                        "Order": tel.Order,
                        "DepTime": moment(tel.DepTime, 'HH:mm:ss').format('HH:mm'),
                        "ArrTime": moment(tel.ArrTime, 'HH:mm:ss').format('HH:mm'),
                        "Routes": routes
                    };
                }
                // el.Stations[parseInt(tel.Station)] = {
                //     "routeCode": routes,
                //     "index": index
                // };
            });
            el.TimeInfos = newTimeInfo;
            el.Routes = el.Routes.filter(onlyUnique);
            el.mainRoute = getMainRoute(el.StartStation, el.EndStation, el, MiddleStation, beforeMiddleStation, afterMiddleStation);
            el.MultiRoute = el.Routes.length !== 1;
            el.trainType = getTrainType(el);
            return el;
        });
        exportNewData(JSON.stringify(fileData));
        exportSpecialLines();
    }

    let types = [];

    function getTrainType(el) {
        switch (el.CarClass) {
            case "1132":
                return "Fast Local";
            case "1131":
                return "Local";
            case "1140":
                return "Ordinary";
            case "1102":
                return "Taroko";
            case "1107":
                return "Puyuma";
            case "1108":
            case "1109":
            case "110B":
            case "110C":
            case "110D":
            case "110E":
            case "110F":
                return "Tze-chiang";
            case "1110":
            case "1111":
            case "1114":
            case "1115":
                return "Chu-kuang";
            case "1120":
                return "Fu-Hsing";
            default:
                types.push({CarClass: el.CarClass, Train: el.Train});
                return "Special";
        }
    }

    function exportNewData(newData) {
        fs.writeFile(destPath + fileName, newData, err => {
            if (err) {
                console.log('Error writing file', err)
            } else {
                console.log('Successfully wrote file')
            }
        })
    }

    let Specials = 0;
    let special = [];

    function getMainRoute(startStation, endStation, el, MiddleStation, beforeMiddleStation, afterMiddleStation) {
        let startNumbers = getRouteNumbers(startStation);
        let endNumbers = getRouteNumbers(endStation);
        if (startNumbers[0] === endNumbers[0]) {
            let startStationCode = getTraWebsiteCode(startStation);
            let endStationCode = getTraWebsiteCode(endStation);
            let middleStationCode = getTraWebsiteCode(MiddleStation);
            let beforeMiddleStationCode = getTraWebsiteCode(beforeMiddleStation);
            let afterMiddleStationCode = getTraWebsiteCode(afterMiddleStation);
            if (middleStationCode > startStationCode && middleStationCode > endStationCode) {
                if (startStationCode > beforeMiddleStationCode && ( middleStationCode > afterMiddleStationCode && afterMiddleStationCode > endStationCode)) {
                    return "-" + startNumbers[0]
                } else {
                    return startNumbers[0]
                }
            } else {
                if ((startStationCode < beforeMiddleStationCode && middleStationCode < afterMiddleStationCode && afterMiddleStationCode < endStationCode) || (beforeMiddleStationCode < startStationCode && middleStationCode < afterMiddleStationCode && afterMiddleStationCode < endStationCode)){
                    return startNumbers[0];
                } else {
                    if (startStationCode < endStationCode && startStationCode < middleStationCode) {
                        if (startNumbers[0] === 4 && endNumbers[0] === 4) {
                            return startNumbers[1];
                        } else {
                            return startNumbers[0];
                        }
                    } else {
                        if (startNumbers[0] === 4 && endNumbers[0] === 4) {
                            return "-" + startNumbers[1];
                        } else {
                            return "-" + startNumbers[0];
                        }
                    }
                }
            }
        } else {
            if (startNumbers.length === 2 && endNumbers.length === 2) {
                if (startNumbers[1] === endNumbers[0]) {
                    return endNumbers[1];
                } else {
                    return "-" + endNumbers[0];
                }
            } else {
                if (startNumbers.length === 2 && endNumbers.length === 1) {
                    return endNumbers[0];
                } else {
                    if (startNumbers.length === 1 && endNumbers.length === 2) {
                        return "-" + endNumbers[0];
                    } else {
                        if (startNumbers.length === 3 || endNumbers.length === 3) {
                            if (startNumbers.length === 2) {
                                return endNumbers[0];
                            } else {
                                return "-" + startNumbers[0];
                            }
                        } else {
                            Specials++;
                            special.push({
                                startStation: startStation,
                                endStation: endStation,
                                startNumbers: startNumbers,
                                endNumbers: endNumbers,
                                route: ObjectLength(el.TimeInfos),
                                details: el
                            });
                            if (startNumbers[0] === 1) {
                                return endNumbers[0];
                            } else {
                                return startNumbers[0];
                            }
                        }
                        // console.log("startNumbers", startNumbers, startNumbers.length, startStation);
                        // console.log("endNumbers", endNumbers, endNumbers.length, endStation);
                        // console.log("Specials");
                        // console.log("startNumbers", startNumbers, startNumbers.length, startStation);
                        // console.log("endNumbers", endNumbers, endNumbers.length, endStation);
                    }
                }
            }
        }
    }

    function ObjectLength(object) {
        let length = 0;
        for (let key in object) {
            if (object.hasOwnProperty(key)) {
                ++length;
            }
        }
        return length;
    };

    function getRouteNumbers(station) {
        return findRightStation(station).routeCode;
    }

    function getTraWebsiteCode(station) {
        return parseInt(findRightStation(station).traWebsiteCode);
    }

    function findRightStation(station) {
        return stationInfo.stations.find((sel => sel.時刻表編號 === parseInt(station)))
    }

    function exportSpecialLines() {
        console.log("!!!!!!!!!!!!!!!!!!!!Specials!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log("Specials", Specials);
        special = unique(special, ['endStation', 'startStation', 'route']);
        let object = {
            lenght: ObjectLength(special),
            special: special
        };
        types = unique(types, ['CarClass']);
        types = sort(types);
        console.log("Different train types", types);
        fs.writeFile(linePath + "specials.json", JSON.stringify(object), err => {
            if (err) {
                console.log('Error writing file', err)
            } else {
                console.log('Successfully wrote file')
            }
        })
    }

    function unique(arr, keyProps) {
        const kvArray = arr.map(entry => {
            const key = keyProps.map(k => entry[k]).join('|');
            return [key, entry];
        });
        const map = new Map(kvArray);
        return Array.from(map.values());
    }

    function sort(list) {
        return list.sort(function (a, b) {
            return ('' + a.CarClass).localeCompare(b.CarClass);
        })
    }
}

function addRoutesToStationFromSpecialRoutes() {

    console.log("Read to do special line");
    readSpecialRoute();

    function readSpecialRoute() {

        async function getJsonFile() {
            return await readFile("./docs/Lines/specials.json");
        }

        getJsonFile().then(specialInfo => {
            updateRouteList(JSON.parse(specialInfo));
        })
    }

    function updateRouteList(specialInfo) {
        if (specialInfo.lenght === 0) {
            console.log("We're done")
        } else {
            readStationInfoFile(specialInfo);
        }
    }

    function readStationInfoFile(specialInfo) {

        async function getJsonFile() {
            return await readFile("./docs/stationInfo.json");
        }

        getJsonFile().then(stationInfo => {
            changeStationInfo(JSON.parse(stationInfo), specialInfo);
        })
    }

    function changeStationInfo(stationInfo, specialInfo) {
        specialInfo.special.forEach(function (el) {
            Object.keys(el.details.TimeInfos).forEach(function (key) {
                let station = stationInfo.stations.find((sel => sel.時刻表編號 === parseInt(key))).routeCode;
                if (!(station.includes(el.details.mainRoute))) {
                    station.push(el.details.mainRoute);
                }
            })
        });
        exportChangedStationInfo(JSON.stringify(stationInfo));
    }

    function exportChangedStationInfo(newData) {
        fs.writeFile("./docs/stationInfo.json", newData, err => {
            if (err) {
                console.log('Error writing file', err)
            } else {
                console.log('Successfully wrote file')
            }
        });
        readDirOfLines();
    }
}