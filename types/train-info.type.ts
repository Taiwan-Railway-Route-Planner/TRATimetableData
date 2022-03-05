import { TimeInfo } from './time-info.type';

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
