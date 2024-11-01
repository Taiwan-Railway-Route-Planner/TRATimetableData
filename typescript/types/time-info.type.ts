export type TimeInfo = {
  Route: string;
  Station: string;
  Order: string;
  DEPTime: string;
  ARRTime: string;
}


export type EnrichedTimeInfo = {
  [key: string]: {
    Station: number;
    Order: string;
    DepTime: string;
    ArrTime: string;
    Routes: number[];
  }
}
