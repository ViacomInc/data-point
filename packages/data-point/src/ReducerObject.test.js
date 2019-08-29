const reducerObject = require("./ReducerObject");
const { Accumulator } = require("./Accumulator");

const constant = require("./reducer-helpers/constant");

const mockCreateReducer = jest.fn(spec => {
  return (value, acc) => spec(value, acc);
});

const mockResolveReducer = (acc, reducer) => {
  return reducer(acc.value, acc);
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("getObjectProperties", () => {
  it("should extract all constant", () => {
    const obj = {
      prop1: constant("prop1"),
      prop2: constant("prop2"),
      prop3: constant({
        a: "a"
      })
    };

    const props = reducerObject.getObjectProperties(mockCreateReducer, obj);
    expect(props.constant).toEqual({
      prop1: "prop1",
      prop2: "prop2",
      prop3: {
        a: "a"
      }
    });
  });

  it("should extract reducer props", () => {
    const obj = {
      prop1: () => true,
      prop2: () => true
    };

    const props = reducerObject.getObjectProperties(mockCreateReducer, obj);
    expect(props.reducers).toMatchInlineSnapshot(`
      Array [
        Object {
          "path": Array [
            "prop1",
          ],
          "reducer": [Function],
        },
        Object {
          "path": Array [
            "prop2",
          ],
          "reducer": [Function],
        },
      ]
    `);
  });

  it("should crawl recursive for nested plainObject properties", () => {
    const obj = {
      nested: {
        nestedDeep: {
          prop1: () => true
        }
      }
    };

    const props = reducerObject.getObjectProperties(mockCreateReducer, obj);
    // nested prop should match path:
    expect(props.reducers[0].path).toEqual(["nested", "nestedDeep", "prop1"]);
    // matching entire reducer structure
    expect(props.reducers).toMatchInlineSnapshot(`
      Array [
        Object {
          "path": Array [
            "nested",
            "nestedDeep",
            "prop1",
          ],
          "reducer": [Function],
        },
      ]
    `);
  });

  it("should parse constant, reducers and plain objects", () => {
    const obj = {
      prop1: constant({
        c: "constant"
      }),
      nested: {
        prop2: () => true,
        nestedDeep: {
          prop3: () => true
        }
      }
    };

    const props = reducerObject.getObjectProperties(mockCreateReducer, obj);

    expect(props).toMatchInlineSnapshot(`
      Object {
        "constant": Object {
          "prop1": Object {
            "c": "constant",
          },
        },
        "reducers": Array [
          Object {
            "path": Array [
              "nested",
              "prop2",
            ],
            "reducer": [Function],
          },
          Object {
            "path": Array [
              "nested",
              "nestedDeep",
              "prop3",
            ],
            "reducer": [Function],
          },
        ],
      }
    `);
  });
});

describe("ReducerObject", () => {
  const { ReducerObject } = reducerObject;
  describe("constructor", () => {
    it("should have no name defined", () => {
      const reducer = new ReducerObject({}, mockCreateReducer);
      expect(reducer.name).toEqual(undefined);
    });

    it("should parse source and set to objectProperties property", () => {
      const reducer = new ReducerObject(
        {
          prop1: constant("prop1"),
          prop2: () => true
        },
        mockCreateReducer
      );
      expect(reducer.objectProperties.constant).toEqual({
        prop1: "prop1"
      });

      expect(reducer.objectProperties.reducers).toHaveLength(1);
    });
  });

  describe("isType", () => {
    it("should return true if source is plain object, false for non", () => {
      // rest of tests are under the isPlainObject unit tests
      expect(ReducerObject.isType({})).toEqual(true);
      expect(ReducerObject.isType(Object.create({}))).toEqual(false);
    });
  });

  describe("resolve", () => {
    it("should resolve object", async () => {
      const reducer = new ReducerObject(
        {
          prop1: constant("prop1"),
          prop2: val => val.prop2,
          prop3: {
            prop4: constant("prop4"),
            prop5: val => val.prop5
          }
        },
        mockCreateReducer
      );

      const acc = new Accumulator({
        value: {
          prop2: "prop2",
          prop5: "prop5"
        }
      });
      const result = await reducer.resolve(acc, mockResolveReducer);

      expect(result).toEqual({
        prop1: "prop1",
        prop2: "prop2",
        prop3: {
          prop4: "prop4",
          prop5: "prop5"
        }
      });
    });

    it("should deepClone constant values", async () => {
      const testConstant = {
        constant: "constant"
      };

      const reducer = new ReducerObject(
        {
          prop1: constant(testConstant)
        },
        mockCreateReducer
      );

      const acc = new Accumulator();
      const result = await reducer.resolve(acc, mockResolveReducer);

      expect(result).toEqual({
        prop1: {
          constant: "constant"
        }
      });

      result.prop1.mutateProp = true;
      expect(testConstant).toEqual({
        constant: "constant"
      });
    });
  });
});
