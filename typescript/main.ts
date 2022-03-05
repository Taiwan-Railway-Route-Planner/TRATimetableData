import { EnrichJsonSchedules } from './enrich-json-schedules.class';
import { StationInformation } from './station-information.class';
import { UtilFunctions } from './util-functions.class';

export const DEST_PATH = './docs/Schedules/';
export const ROUTES_THAT_NEED_UPDATES_DIR = './docs/routes/';

const enrichJsonSchedules = new EnrichJsonSchedules(
  new UtilFunctions(),
  new StationInformation(),
);

enrichJsonSchedules.run();
