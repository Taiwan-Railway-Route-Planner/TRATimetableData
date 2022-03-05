import { readFileSync, readdirSync, writeFile } from 'fs';
import moment from 'moment';
import { StationDetails, StationInfo } from './types/station-info.type';
import { EnrichedTaiwanRailwaySchedule, TaiwanRailwaySchedule } from './types/taiwan-railway-schedule.type';
import { EnrichedTimeInfo, TimeInfo } from './types/time-info.type';
import { BaseTrainInfo, EnrichedTrainInfo, TrainInfo } from './types/train-info.type';

const ROUTES_THAT_NEED_UPDATES_DIR = './docs/routes/';
const DEST_PATH = './docs/Schedules/';
const LINE_PATH = './docs/Lines/';

export class StationInformation {

  private STATION_INFORMATION: StationInfo = null;

  /**
   * By calling this you will get the information of all stations that's stored in the file
   * ./docs/stationInfo.json
   */
  public getStationInformation(): StationInfo {
    if (this.STATION_INFORMATION === null) {
      this.STATION_INFORMATION = JSON.parse(readFileSync('./docs/stationInfo.json', 'utf-8'));
    }
    return this.STATION_INFORMATION;
  }
}


class EnrichJsonSchedules {

  private SCHEDULES_NEED_UPDATE: string[];

  constructor(
    private utils: UtilFunctions,
    private stationInformation: StationInformation,
  ) {
  }

  public setup(): void {
    this.getAllFileNamesThatNeedToBeUpdated();
    this.enrichAllSchedules();
  }

  /**
   * Get All the file names we need to updated
   */
  private getAllFileNamesThatNeedToBeUpdated(): void {
    this.SCHEDULES_NEED_UPDATE = this.utils.readDirectory(ROUTES_THAT_NEED_UPDATES_DIR);
  }

  /**
   * Enrich all the schedules by going over the directory
   * of schedules that need updates + save those changes
   */
  private enrichAllSchedules(): void {

    this.SCHEDULES_NEED_UPDATE.forEach((scheduleName: string) => {
      const scheduleNeedsUpdate: TaiwanRailwaySchedule = this.utils.readFileSync<TaiwanRailwaySchedule>(scheduleName, ROUTES_THAT_NEED_UPDATES_DIR);
      const enrichedTrainInfos : EnrichedTrainInfo[] = this.enrichScheduleInformation(scheduleNeedsUpdate, this.stationInformation.getStationInformation());


      try {
        const jsonExport = JSON.stringify({ TrainInfos: enrichedTrainInfos } as EnrichedTaiwanRailwaySchedule, null, 4);
        this.utils.writeFile(DEST_PATH, scheduleName, jsonExport);
      } catch (e) {
        console.log(e.error, scheduleName)
      }
    });

  }

  /**
   * Enrich the schedules with more information
   */
  private enrichScheduleInformation(scheduleNeedsUpdate: TaiwanRailwaySchedule, trainInformation: StationInfo): EnrichedTrainInfo[] {

    return scheduleNeedsUpdate.TrainInfos.map((trainInfo: TrainInfo) => {
      // @ts-ignore
      let enrichedTrainInfo: EnrichedTrainInfo = {};

      enrichedTrainInfo.StartStation = parseInt(trainInfo.TimeInfos[0].Station);
      enrichedTrainInfo.StartTime = moment(trainInfo.TimeInfos[0].DEPTime, 'HH:mm:ss').format('HH:mm');
      enrichedTrainInfo.EndStation = parseInt(trainInfo.TimeInfos[trainInfo.TimeInfos.length - 1].Station);
      enrichedTrainInfo.EndTime = moment(trainInfo.TimeInfos[trainInfo.TimeInfos.length - 1].DEPTime, 'HH:mm:ss').format('HH:mm');
      enrichedTrainInfo.Stations = {};
      enrichedTrainInfo.Routes = [];
      // let MiddleStation = trainInfo.TimeInfos[Math.round((trainInfo.TimeInfos.length - 1) / 2)].Station;
      // let beforeMiddleStation = trainInfo.TimeInfos[Math.round(((trainInfo.TimeInfos.length - 1) / 2) / 2)].Station;
      // let afterMiddleStation = trainInfo.TimeInfos[Math.round(((trainInfo.TimeInfos.length - 1) / 2) + ((trainInfo.TimeInfos.length - 1) / 2) / 2)].Station;

      enrichedTrainInfo.TimeInfos = this.enrichTimeInfoOfSchedules(trainInfo, trainInformation, enrichedTrainInfo);
      enrichedTrainInfo.Routes = enrichedTrainInfo.Routes.filter(this.utils.onlyUnique);
      enrichedTrainInfo.MultiRoute = enrichedTrainInfo.Routes.length !== 1;
      enrichedTrainInfo.trainType = this.utils.getTrainType(enrichedTrainInfo);

      enrichedTrainInfo = this.enrichBaseTrainInfoToEnrichedTrainInfo(trainInfo, enrichedTrainInfo);

      return enrichedTrainInfo;
    });
  }

  /**
   * Update the timeInfo of a train travel to {@link EnrichedTimeInfo}
   *
   * @param trainInfo the unriched information about the train ride
   * @param trainInformation the information of stations
   * @param updateTrainInfo the enriched information about the train ride
   */
  private enrichTimeInfoOfSchedules(trainInfo: TrainInfo, trainInformation: StationInfo, updateTrainInfo: EnrichedTrainInfo): EnrichedTimeInfo {
    const enrichedTrainInfo: EnrichedTimeInfo = {};
    let isTaipeiAlreadyAdded = false;

    // TODO remove the station 5170 from the list because it's not yet in use
    const timeInfos: TimeInfo[] = trainInfo.TimeInfos.filter((timeInfo: TimeInfo) => timeInfo.Station !== '5170');

    timeInfos.forEach((timeInfo: TimeInfo) => {

      if (timeInfo.Station === '1001') {
        timeInfo.Station = '1008';
      } else {
        const result = trainInformation.stations
          .find((stationDetails: StationDetails) => stationDetails.traWebsiteCode === timeInfo.Station);

        // This means there is a new station added
        if (result == null) {
          console.error(`There is a new station added with ID: '${timeInfo.Station}'`);
        } else {
          timeInfo.Station = result.時刻表編號.toString();
        }
      }

      const routes: number[] = trainInformation.stations
        .find((stationDetails: StationDetails) => stationDetails.時刻表編號 === parseInt(timeInfo.Station)).routeCode;
      updateTrainInfo.Routes = updateTrainInfo.Routes.concat(routes);

      if (trainInfo.Train === '1' || trainInfo.Train === '2') {
        // This is because this TRAIN can do a round trip from Taipei to Taipei
        if (timeInfo.Station === '1008' && isTaipeiAlreadyAdded) {
          enrichedTrainInfo['_' + timeInfo.Station] = {
            Station: timeInfo.Station,
            Order: timeInfo.Order,
            DepTime: this.utils.formatStringToTimestamp(timeInfo.DEPTime),
            ArrTime: this.utils.formatStringToTimestamp(timeInfo.ARRTime),
            Routes: routes,
          };
        } else {
          enrichedTrainInfo[timeInfo.Station] = {
            Station: timeInfo.Station,
            Order: timeInfo.Order,
            DepTime: this.utils.formatStringToTimestamp(timeInfo.DEPTime),
            ArrTime: this.utils.formatStringToTimestamp(timeInfo.ARRTime),
            Routes: routes,
          };
          isTaipeiAlreadyAdded = true;
        }
      } else {
        enrichedTrainInfo[timeInfo.Station] = {
          Station: timeInfo.Station,
          Order: timeInfo.Order,
          DepTime: this.utils.formatStringToTimestamp(timeInfo.DEPTime),
          ArrTime: this.utils.formatStringToTimestamp(timeInfo.ARRTime),
          Routes: routes,
        };
      }
    });

    return enrichedTrainInfo;
  }

  private enrichBaseTrainInfoToEnrichedTrainInfo(trainInfo: TrainInfo, enrichedTrainInfo: EnrichedTrainInfo): EnrichedTrainInfo {
    const cloneTrainInfo: TrainInfo = Object.assign(trainInfo);
    delete cloneTrainInfo.TimeInfos;

    return {
      ...cloneTrainInfo as BaseTrainInfo,
      ...enrichedTrainInfo,
    };
  }

}


export class UtilFunctions {

  /**
   * This function will return all the file names in a certain directory
   * @param path you want to read the files from
   */
  public readDirectory(path: string): string[] {
    return readdirSync(path);
  }

  /**
   * Read a file from a certain path and get parsed result back
   * @param fileName the file you want to read from
   * @param path the path you want to read the file from
   */
  public readFileSync<T>(fileName: string, path: string): T {
    return JSON.parse(readFileSync(path + fileName, 'utf-8'));
  }

  /**
   * This function will format you time sting without the seconds
   * @param stringTime string contain a time format
   */
  public formatStringToTimestamp(stringTime: string): string {
    return moment(stringTime, 'HH:mm:ss').format('HH:mm');
  }

  /**
   *
   * @param value number you want to compare with
   * @param index the number you want to check
   * @param self the array of numbers
   */
  public onlyUnique(value: number, index: number, self: number[]): boolean {
    return self.indexOf(value) === index;
  }

  /**
   * Save a file to a certain path
   * @param path the path you want to read the file too
   * @param fileName the name of the file you want to save
   * @param data the data you want to save in the file
   */
  public writeFile(path: string, fileName: string, data: string): void {
    writeFile(DEST_PATH + fileName, data, err => {
      if (err) {
        console.error(`Something went wrong when trying to save the file '${fileName}', it thrown the following error: ${err}`);
      }
    });
  }

  /**
   * Determine what kind of carClass the train is, if the carClass is new
   * it will default to type 'Special' and will log a warning
   * @param enrichedTrainInfo the enriched information for train ride
   */
  public getTrainType(enrichedTrainInfo: EnrichedTrainInfo): string {
    switch (enrichedTrainInfo.CarClass) {
      case '1132':
        return 'Fast Local';
      case '1130':
      case '1131':
      case '1112':
      case '1134':
      case '1154':
        return 'Local';
      case '1140':
      case '1150':
        return 'Ordinary';
      case '1102':
      case '1101':
        return 'Taroko';
      case '1107':
        return 'Puyuma';
      case '1104':
      case '1105':
      case '1106':
      case '1108':
      case '1109':
      case '1100':
      case '110A':
      case '110B':
      case '110C':
      case '110D':
      case '110E':
      case '110F':
      case '110G':
        return 'Tze-chiang';
      case '1110':
      case '1111':
      case '1113':
      case '1114':
      case '1115':
        return 'Chu-kuang';
      case '1120':
      case '1121':
        return 'Fu-Hsing';
      default:
        console.warn(JSON.stringify(
          { CarClass: enrichedTrainInfo.CarClass, Train: enrichedTrainInfo.Train, Note: enrichedTrainInfo.Note },
        ));
        return 'Special';
    }
  }

}
