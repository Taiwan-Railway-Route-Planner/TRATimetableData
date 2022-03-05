export type TimeInfo = {
  Route: string;
  Station: string;
  Order: string;
  DEPTime: string;
  ARRTime: string;
}


export type EnrichedTimeInfo = {
  [key: string]: {
    Station: string;
    Order: string;
    DepTime: string;
    ArrTime: string;
    Routes: number[];
  }
}
