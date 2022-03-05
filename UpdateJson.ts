import { readFileSync, readdirSync } from 'fs';
import { StationInfo } from './types/station-info.type';

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
    private stationInformation: StationInformation
  ) {}

  public setup(): void {
    this.getAllFileNamesThatNeedToBeUpdated();
    this.enrichScheduleInformation();
  }

  /**
   * Get All the file names we need to updated
   */
  private getAllFileNamesThatNeedToBeUpdated(): void {
    this.SCHEDULES_NEED_UPDATE = this.utils.readDirectory(ROUTES_THAT_NEED_UPDATES_DIR);
  }

  private enrichScheduleInformation(): void {

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
  public readFileSync(fileName: string, path: string): object {
    return JSON.parse(readFileSync(path + fileName, 'utf-8'));
  }
}
