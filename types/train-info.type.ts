import { EnrichedTimeInfo, TimeInfo } from './time-info.type';

export type TrainInfo = Readonly<{
  Type:         string;
  Train:        string;
  BreastFeed:   string;
  Route:        string;
  Package:      string;
  OverNightStn: string;
  LineDir:      string;
  Line:         string;
  Dinning:      string;
  FoodSrv:      string;
  Cripple:      string;
  CarClass:     string;
  Bike:         string;
  ExtraTrain:   string;
  Everyday:     string;
  Note:         string;
  NoteEng:      string;
  TimeInfos:    TimeInfo[];
}>


export type EnrichedTrainInfo = Readonly<{
  Type:         string;
  Train:        string;
  BreastFeed:   string;
  Route:        string;
  Package:      string;
  OverNightStn: string;
  LineDir:      string;
  Line:         string;
  Dinning:      string;
  Cripple:      string;
  CarClass:     string;
  Bike:         string;
  Note:         string;
  NoteEng:      string;
  TimeInfos:    { [key: string]: EnrichedTimeInfo };
  StartStation: number;
  StartTime:    string;
  EndStation:   number;
  EndTime:      string;
  Stations:     Stations;
  Routes:       number[];
  MultiRoute:   boolean;
  trainType:    string;
}>


// eslint-disable-next-line @typescript-eslint/ban-types
export type Stations = Readonly<{}>
