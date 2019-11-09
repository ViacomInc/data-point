/* eslint-env jest */

const DataPoint = require("../index");

const reducers = require("../../test/utils/reducers");
const entities = require("../../test/definitions/entities");

const Transform = require("./transform");
const TestData = require("../../test/data.json");

let dataPoint;

beforeAll(() => {
  dataPoint = DataPoint.create({
    values: {
      v1: "v1"
    },
    reducers: {
      test: reducers
    },
    entities
  });
});

describe("transform", () => {
  test("transform - throw error in invalid id(promise)", async () => {
    await expect(
      Transform.transform(dataPoint, "INVALID", TestData, {})
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  describe("transform - should attach input value to accumulator", () => {
    const expectedReceivedMatrix = [
      ["undefined", undefined, undefined],
      ["zero", 0, 0],
      ["number", 1, 1],
      ["empty string", "", ""],
      ["string", "Hello World", "Hello World"],
      ["false", false, false],
      ["true", true, true],
      ["array", ["a", "b"], ["a", "b"]],
      ["Object", { a: true }, { a: true }]
    ];

    expectedReceivedMatrix.forEach(([type, input, output]) => {
      test(`passing ${type}`, async () => {
        const result = await Transform.transform(
          dataPoint,
          value => value,
          input
        );
        expect(result.value).toEqual(output);
      });
    });
  });

  test("transform - single reducer", async () => {
    const reducer = value => {
      return `${value} World`;
    };
    const res = await Transform.transform(dataPoint, reducer, "Hello");
    expect(res.value).toEqual("Hello World");
  });

  test("transform - reducer chain", async () => {
    const testReducers = [value => `${value} World`, value => `${value}!!`];
    const res = await Transform.transform(dataPoint, testReducers, "Hello");
    expect(res.value).toEqual("Hello World!!");
  });

  test("transform - reducer path", async () => {
    const res = await Transform.transform(dataPoint, "$a.b.c", TestData);
    expect(res.value).toEqual([1, 2, 3]);
  });

  test("transform - reducer mixed", async () => {
    const getMax = value => {
      return Math.max.apply(null, value);
    };
    const res = await Transform.transform(
      dataPoint,
      ["$a.b.c", getMax],
      TestData
    );

    expect(res.value).toEqual(3);
  });

  test("should handle callback signature", done => {
    const reducer = value => {
      return `${value} World`;
    };
    Transform.transform(dataPoint, reducer, "Hello", null, (error, res) => {
      expect(res.value).toEqual("Hello World");
      done();
    });
  });

  test("should handle callback signature with error", done => {
    const reducer = () => {
      throw new Error("test");
    };
    Transform.transform(dataPoint, reducer, "Hello", null, (error, res) => {
      expect(error).toMatchInlineSnapshot(`[Error: test]`);
      expect(res).toEqual(undefined);
      done();
    });
  });
});

describe("options argument", () => {
  test("passing locals", async () => {
    const reducer = (value, acc) => {
      return `${acc.locals.greeting} World`;
    };

    const options = {
      locals: {
        greeting: "Hello"
      }
    };

    const res = await Transform.transform(dataPoint, reducer, {}, options);
    expect(res.value).toEqual("Hello World");
  });
});

describe("resolve", () => {
  test("transform - resolve", async () => {
    const value = await Transform.resolve(dataPoint, "$a.b.c", TestData);
    expect(value).toEqual([1, 2, 3]);
  });
  test("transform - options is last argument", async () => {
    const options = {
      locals: {
        foo: "bar"
      }
    };
    const value = await Transform.resolve(
      dataPoint,
      "$..locals.foo",
      {},
      options
    );

    expect(value).toEqual("bar");
  });

  test("transform - execute with 3 arguments", async () => {
    const value = {
      foo: "bar"
    };
    const curried = Transform.resolve(dataPoint, "$foo");
    const resolvedValue = await curried(value);
    expect(resolvedValue).toEqual("bar");
  });
});

describe("dataPoint.createReducer", () => {
  test("it should evaluate an existing reducer", async () => {
    const reducer = DataPoint.createReducer(["$a", input => input + 1]);
    const output = await dataPoint.resolve(reducer, { a: 5 });
    expect(output).toBe(6);
  });
});
