/* eslint-env jest */

const DataPoint = require("../../../index");

const constant = DataPoint.constant;

const dataPoint = DataPoint.create();

describe("ReducerConstant#resolve", () => {
  test("constant with nested object", async () => {
    const source = {
      a: "$a",
      b: 1,
      c: {
        a: "$c.a"
      }
    };
    const input = {};

    const result = await dataPoint.transform(constant(source), input);
    expect(result.value).toEqual(source);
  });

  test("constant with a function", async () => {
    const source = () => {
      throw new Error();
    };
    const input = 1;

    const result = await dataPoint.transform(constant(source), input);

    expect(result).not.toBeInstanceOf(Error);
    expect(result.value).toEqual(source);
    expect(() => result.value()).toThrow();
  });

  test("constants inside of a ReducerObject", async () => {
    const source = {
      a: "$a",
      b: "$b",
      c: constant({
        a: "$c.a"
      }),
      d: constant(1)
    };
    const input = {
      a: 1,
      b: 2,
      c: {
        a: 1
      }
    };

    const result = await dataPoint.transform(source, input);
    expect(result.value).toEqual({
      a: 1,
      b: 2,
      c: {
        a: "$c.a"
      },
      d: 1
    });
  });
});
