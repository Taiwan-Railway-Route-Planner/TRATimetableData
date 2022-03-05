import { EnrichedTrainInfo, TrainInfo } from './train-info.type';

export type TaiwanRailwaySchedule = Readonly<{
  TrainInfos: TrainInfo[];
  UpdateTime: Date;
}>


export type EnrichedTaiwanRailwaySchedule = Readonly<{
  TrainInfos: EnrichedTrainInfo[];
}>
