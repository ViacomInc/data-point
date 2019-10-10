import * as React from 'react';

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

  interface Reducer {
  }

  interface RDOMElement {
    type: React.ElementType;
    props: object;
    children: Array<RDOMElement | string>;
  }
}
