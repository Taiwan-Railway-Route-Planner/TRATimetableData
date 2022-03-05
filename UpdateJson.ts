import { readFileSync, readdirSync } from 'fs';
import moment from 'moment';
import { StationInfo } from './types/station-info.type';
import { EnrichedTaiwanRailwaySchedule, TaiwanRailwaySchedule } from './types/taiwan-railway-schedule.type';
import { EnrichedTimeInfo, TimeInfo } from './types/time-info.type';
import { EnrichedTrainInfo, TrainInfo } from './types/train-info.type';

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
      this.enrichScheduleInformation(scheduleNeedsUpdate, this.stationInformation.getStationInformation());
    });

  }

  /**
   * Enrich the schedules with more information
   */
  private enrichScheduleInformation(scheduleNeedsUpdate: TaiwanRailwaySchedule, trainInformation: StationInfo): void {

    const updateSchedule: EnrichedTaiwanRailwaySchedule = scheduleNeedsUpdate.TrainInfos.map((trainInfo: TrainInfo) => {
      let updateTrainInfo: EnrichedTrainInfo = {};

      updateTrainInfo.StartStation = parseInt(trainInfo.TimeInfos[0].Station);
      updateTrainInfo.StartTime = moment(trainInfo.TimeInfos[0].DEPTime, 'HH:mm:ss').format('HH:mm');
      updateTrainInfo.EndStation = parseInt(trainInfo.TimeInfos[trainInfo.TimeInfos.length - 1].Station);
      updateTrainInfo.EndTime = moment(trainInfo.TimeInfos[trainInfo.TimeInfos.length - 1].DEPTime, 'HH:mm:ss').format('HH:mm');
      updateTrainInfo.Stations = {};
      updateTrainInfo.Routes = [];
      // let MiddleStation = trainInfo.TimeInfos[Math.round((trainInfo.TimeInfos.length - 1) / 2)].Station;
      // let beforeMiddleStation = trainInfo.TimeInfos[Math.round(((trainInfo.TimeInfos.length - 1) / 2) / 2)].Station;
      // let afterMiddleStation = trainInfo.TimeInfos[Math.round(((trainInfo.TimeInfos.length - 1) / 2) + ((trainInfo.TimeInfos.length - 1) / 2) / 2)].Station;

      updateTrainInfo.TimeInfos = this.enrichTimeInfoOfSchedules(trainInfo.TimeInfos, trainInformation);


      return updateTrainInfo;
    });

  }

  /**
   * Update the timeInfo of a train travel to {@link EnrichedTimeInfo}
   *
   * @param timeInfos the unaltered timeInfo of a certain train travel
   */
  private enrichTimeInfoOfSchedules(timeInfos: TimeInfo[], trainInformation: StationInfo): EnrichedTimeInfo {
    let enrichedTrainInfo: EnrichedTrainInfo = {};
    let isTaipeiAlreadyAdded = false;

    // TODO remove the station 5170 from the list because it's not yet in use
    timeInfos = timeInfos.filter((timeInfo: TimeInfo) => timeInfo.Station !== '5170');

    timeInfos.forEach((timeInfo: TimeInfo) => {

      if (timeInfo.Station === '1001') {
        timeInfo.Station = '1008';
      } else {
        const result = trainInformation.stations.find((sel => parseInt(sel.traWebsiteCode) === parseInt(tel.Station)));
        if (result == null) {
          console.error(JSON.stringify(tel.Station));
        } else {
          tel.Station = result.時刻表編號;
        }
      }

    });

    return null;
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
   * @param fileName the file you want to read
   * @param path the path you want to read the file from
   */
  public readFileSync<T>(fileName: string, path: string): T {
    return JSON.parse(readFileSync(path + fileName, 'utf-8'));
  }
}
