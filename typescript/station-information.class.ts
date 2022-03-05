import { readFileSync } from 'fs';
import { StationInfo } from './types/station-info.type';

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
