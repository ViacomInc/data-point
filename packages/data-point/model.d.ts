declare class Reducer {
  name: string;
}

interface MapSettings {
  name: string;
}

declare function model(spec: MapSettings): Reducer;

export = model;
