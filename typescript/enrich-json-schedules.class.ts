import moment from 'moment';
import { StationDetails, StationInfo } from '../types/station-info.type';
import { EnrichedTaiwanRailwaySchedule, TaiwanRailwaySchedule } from '../types/taiwan-railway-schedule.type';
import { EnrichedTimeInfo, TimeInfo } from '../types/time-info.type';
import { BaseTrainInfo, EnrichedTrainInfo, TrainInfo } from '../types/train-info.type';
import { DEST_PATH, ROUTES_THAT_NEED_UPDATES_DIR } from './main';
import { StationInformation } from './station-information.class';
import { UtilFunctions } from './util-functions.class';

export class EnrichJsonSchedules {

  private SCHEDULES_NEED_UPDATE: string[];

  constructor(
    private utils: UtilFunctions,
    private stationInformation: StationInformation,
  ) {
  }

  public run(): void {
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

    console.info("I'm done with enriching!")

  }

  /**
   * Enrich the schedules with more information
   */
  private enrichScheduleInformation(scheduleNeedsUpdate: TaiwanRailwaySchedule, trainInformation: StationInfo): EnrichedTrainInfo[] {

    return scheduleNeedsUpdate.TrainInfos.map((trainInfo: TrainInfo) => {
      // @ts-ignore
      let enrichedTrainInfo: EnrichedTrainInfo = {};

      enrichedTrainInfo = this.enrichBaseTrainInfoToEnrichedTrainInfo(trainInfo, enrichedTrainInfo);

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
            Station: parseInt(timeInfo.Station),
            Order: timeInfo.Order,
            DepTime: this.utils.formatStringToTimestamp(timeInfo.DEPTime),
            ArrTime: this.utils.formatStringToTimestamp(timeInfo.ARRTime),
            Routes: routes,
          };
        } else {
          enrichedTrainInfo[timeInfo.Station] = {
            Station: parseInt(timeInfo.Station),
            Order: timeInfo.Order,
            DepTime: this.utils.formatStringToTimestamp(timeInfo.DEPTime),
            ArrTime: this.utils.formatStringToTimestamp(timeInfo.ARRTime),
            Routes: routes,
          };
          isTaipeiAlreadyAdded = true;
        }
      } else {
        enrichedTrainInfo[timeInfo.Station] = {
          Station: parseInt(timeInfo.Station),
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
    const cloneTrainInfo: TrainInfo = Object.assign({}, trainInfo);
    delete cloneTrainInfo.TimeInfos;

    return {
      ...cloneTrainInfo as BaseTrainInfo,
      ...enrichedTrainInfo,
    };
  }

}


