const dataPoint = require("./DataPoint");
const { Accumulator } = require("./Accumulator");
const { Cache } = require("./Cache");

const sayHello = value => `Hello ${value}`;
const getAccumulator = (input, acc) => acc;

const shallowTracer = {
  startSpan: () => Object.create(shallowTracer),
  setTag: () => true,
  log: () => true
};

describe("resolveFromAccumulator", () => {
  it("should run reducers using accumulator as input", async () => {
    const acc = new Accumulator({ value: "world" });
    const result = await dataPoint.resolveFromAccumulator(acc, sayHello);
    expect(result).toEqual("Hello world");
  });
});

describe("resolveFromInput", () => {
  it("should run reducers against input", async () => {
    const result = await dataPoint.resolveFromInput("world", sayHello);
    expect(result).toEqual("Hello world");
  });

  describe("passing options object to accumulator", () => {
    const options = {
      locals: {
        key: "value"
      },
      cache: {
        get: () => true,
        set: () => true
      },
      tracer: "tracer"
    };
    it("should pass locals object", async () => {
      const result = await dataPoint.resolveFromInput(
        "input",
        getAccumulator,
        options
      );
      expect(result).toHaveProperty("locals", options.locals);
    });

    it("should pass cache object", async () => {
      const result = await dataPoint.resolveFromInput(
        "input",
        getAccumulator,
        options
      );
      expect(result).toHaveProperty("cache", options.cache);
    });

    it("should pass tracer object", async () => {
      const result = await dataPoint.resolveFromInput(
        "input",
        getAccumulator,
        options
      );
      expect(result).toHaveProperty("tracer", options.tracer);
    });

    it("should pass resolveFromAccumulator method", async () => {
      const nestedResolver = (input, acc) => `nested ${acc.value}`;

      const resolveNestedReducer = (input, acc) => {
        return acc.resolve(nestedResolver);
      };

      const result = await dataPoint.resolveFromInput(
        "input",
        resolveNestedReducer,
        options
      );
      expect(result).toEqual("nested input");
    });
  });
});

describe("validateLocals", () => {
  it("should only allow undefined or plain object", () => {
    expect(() => {
      dataPoint.validateLocals();
    }).not.toThrow();

    expect(() => {
      dataPoint.validateLocals({});
    }).not.toThrow();
  });

  it("should throw error on any un-valid value", () => {
    expect(() => {
      dataPoint.validateLocals(null);
    }).toThrowErrorMatchingInlineSnapshot(
      `"'options.locals' must be undefined or a plain object"`
    );

    expect(() => {
      dataPoint.validateLocals("string");
    }).toThrowErrorMatchingInlineSnapshot(
      `"'options.locals' must be undefined or a plain object"`
    );

    expect(() => {
      dataPoint.validateLocals([]);
    }).toThrowErrorMatchingInlineSnapshot(
      `"'options.locals' must be undefined or a plain object"`
    );
  });
});

describe("validateTracer", () => {
  it("should only allow undefined or well defined tracer span API", () => {
    expect(() => {
      dataPoint.validateTracer();
    }).not.toThrow();

    expect(() => {
      dataPoint.validateTracer(shallowTracer);
    }).not.toThrow();
  });

  it("should throw error on any un-valid value", () => {
    expect(() => {
      dataPoint.validateTracer({});
    }).toThrowErrorMatchingInlineSnapshot(
      `"tracer.startSpan must be a function, tracer expects opentracing API (see https://opentracing.io)"`
    );

    expect(() => {
      dataPoint.validateTracer({
        startSpan: () => true
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `"tracer.setTag must be a function, tracer expects opentracing API (see https://opentracing.io)"`
    );

    expect(() => {
      dataPoint.validateTracer({
        startSpan: () => true,
        setTag: () => true
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `"tracer.log must be a function, tracer expects opentracing API (see https://opentracing.io)"`
    );
  });
});

describe("DataPoint", () => {
  const DataPoint = dataPoint.DataPoint;

  describe("constructor", () => {
    it("should initialize cache", () => {
      const dp = new DataPoint();
      expect(dp.cache).toBeInstanceOf(Cache);
    });
  });

  describe("create", () => {
    it("should create instance of itself", () => {
      const dp = DataPoint.create();
      expect(dp).toBeInstanceOf(DataPoint);
    });
  });

  describe("resolve", () => {
    it("should resolve input", async () => {
      const dp = new DataPoint();
      const result = await dp.resolve("world", sayHello);
      expect(result).toEqual("Hello world");
    });

    it("should pass cache object", async () => {
      const dp = new DataPoint();
      dp.cache.get = () => true;
      dp.cache.set = () => true;

      const result = await dp.resolve("input", getAccumulator);
      expect(result).toHaveProperty("cache", dp.cache);
    });

    it("should pass options object", async () => {
      const dp = new DataPoint();
      const options = {
        locals: {
          key: "value"
        },
        tracer: shallowTracer
      };
      const result = await dp.resolve("input", getAccumulator, options);
      expect(result).toHaveProperty("locals", options.locals);
      expect(result).toHaveProperty("tracer");
    });
  });
});
