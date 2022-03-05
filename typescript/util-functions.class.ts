import { readdirSync, readFileSync, writeFile } from 'fs';
import moment from 'moment';
import { EnrichedTrainInfo } from '../types/train-info.type';
import { DEST_PATH } from './main';

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
      case '110H':
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
