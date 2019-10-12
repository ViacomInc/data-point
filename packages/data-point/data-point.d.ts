export declare namespace DataPoint {
  interface Accumulator {
    value: any;
    locals: object;
    values: any;
    reducer: object
    trace: boolean;
    context: object;
    traceGraph: [];
  }

  interface Reducer {}
}
