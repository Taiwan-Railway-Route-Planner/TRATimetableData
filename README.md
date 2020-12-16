# TRATimetableData

This repo was originally forked from [g0v-data](https://github.com/g0v-data/railway)

Original fork of my => https://github.com/DepickereSven/TRA-Information

## Station information

type: 
- csv (station.csv)
- GeoJSON (station.json)

## Office information

type: csv (offices.csv)

## RailInformation

[Data.gov.tw website for the data subset](https://data.gov.tw/dataset/6138#r1)
 
[XML-downloads](https://ods.railway.gov.tw/tra-ods-web/ods/download/dataResource/railway_schedule/XML/list)\
[JSON-downloads](https://ods.railway.gov.tw/tra-ods-web/ods/download/dataResource/railway_schedule/JSON/list)

#### Original json files from the website

Can be found here: [TRAOriginalTimeTable](https://github.com/Taiwan-Railway-Route-Planner/TRAOriginalTimeTable)


[StationInfo with names in English](https://taiwan-railway-route-planner.github.io/TRATimetableData/stationInfo.json)

## Schedules in JSON 

By example https://taiwan-railway-route-planner.github.io/TRATimetableData/Schedules/20190615.json


## Train Types

CarClass    |Type ENG    | Type TW   | Example train number | 
----------- |----------- |-----------|----------------------|
1102        |Taroko      |太魯閣      |219                   | 
1107        |Puyuma      |普悠瑪      |218                   | 
1104        |Tze-Chiang  |自強        |6170                  | 
1106        |Tze-Chiang  |自強        |6092                  | 
1108        |Tze-Chiang  |自強        |115                   | 
1109        |Tze-Chiang  |自強        |146                   | 
110B        |Tze-Chiang  |自強        |168                   | 
110C        |Tze-Chiang  |自強        |130                   | 
110D        |Tze-Chiang  |自強        |420                   | 
110E        |Tze-Chiang  |自強        |321                   | 
110F        |Tze-Chiang  |自強        |324                   | 
1110        |Chu-Kuang   |莒光        |612                   | 
1111        |Chu-Kuang   |莒光        |501                   | 
1114        |Chu-Kuang   |莒光        |701                   | 
1115        |Chu-Kuang   |莒光        |754                   | 
1120        |Fu-Hsing    |復興        |683                   | 
1140        |Ordinary    |普快        |3672                  | 
1150        |Ordinary    |普快        |6731                  | 
1130        |Local       |區間        |6757                  | 
1131        |Local       |區間        |1148                  | 
1154        |Local       |區間        |6779                  |
1132        |Fast Local  |區間快      |2008                  | 


## Fare Types

E-ticket: 

| Train name   | Fare per milage  | Discount notice |
| ------------- | ------------- | ------------- |
| Ordinary  | 1.46 TWD  | 10 % on the entire travel  |
| Local   | 1.46 TWD  | 10 % on the entire travel  |
| Fast-Local   | 1.46 TWD  | 10 % on the entire travel  |
| Fu-Hsing  | 1.46 TWD  | 10 % on the entire travel  |
| Chu-Kang  | 1.46 TWD  | 10 % on the entire travel  |
| Tze-Chiang  | 2.27 TWD  | The first 70 km are at a fare of 1.46 TWD with a 10% discount there after the fare is 2.27 TWD  |

Single Ticket

| Train name   | Fare per milage  | 
| ------------- | ------------- | 
| Ordinary  | 1.06TWD  | 
| Local   | 1.46 TWD  | 
| Fu-Hsing  | 1.46 TWD  | 
| Fast Local  | 1.46 TWD  |
| Chu-Kang  | 1.46 TWD  |
| Tze-Chiang  | 2.27 TWD  |
| Puyama  | 2.27 TWD  |
| Taroko  | 2.27 TWD  |
