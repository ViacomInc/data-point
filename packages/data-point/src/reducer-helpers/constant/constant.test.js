jest.mock("lodash/cloneDeep");
const mockCloneDeep = require("lodash/cloneDeep");

mockCloneDeep.mockImplementation(jest.requireActual("lodash/cloneDeep"));

const { ReducerConstant, cloneObject } = require("./constant");

afterEach(() => {
  jest.clearAllMocks();
});

describe("cloneObject", () => {
  it("should not clone if parameter isObject is passed as false", () => {
    const result = cloneObject(false, "string");
    expect(mockCloneDeep).not.toBeCalled();
    expect(result).toEqual("string");
  });

  it("should clone if parameter isObject is passed as true", () => {
    const source = {};
    const result = cloneObject(true, source);
    expect(mockCloneDeep).toBeCalled();
    source.mutated = true;
    expect(result).toEqual({});
  });
});

describe("ReducerConstant", () => {
  describe("constructor", () => {
    it("should set constantValue to source received", () => {
      const reducer = new ReducerConstant("value");
      expect(reducer.constantValue).toEqual("value");
    });

    it("should not clone non-plain objects", () => {
      const reducer = new ReducerConstant(true);

      expect(reducer.constantValue).toEqual(true);
      expect(mockCloneDeep).not.toBeCalled();
    });

    it("should set constantValue to be deep cloned from source received", () => {
      const sourceObject = {
        test: "test"
      };
      const reducer = new ReducerConstant(sourceObject);

      sourceObject.mutateSource = true;

      expect(reducer.constantValue).not.toHaveProperty("mutateSource", true);
      expect(reducer.constantValue).toEqual({
        test: "test"
      });
    });
  });

  describe("create", () => {
    it("should create new instance", () => {
      const reducer = ReducerConstant.create("value");
      expect(reducer.constantValue).toEqual("value");
    });
  });

  describe("resolve", () => {
    it("should return provided source", () => {
      const sourceObject = {
        test: "test"
      };
      const reducer = ReducerConstant.create(sourceObject);
      expect(reducer.resolve()).toEqual(sourceObject);
    });

    it("should return deep cloned value for plain objects", () => {
      const sourceObject = {
        test: "test"
      };
      const reducer = ReducerConstant.create(sourceObject);
      const result = reducer.resolve();
      result.mutateResult = true;

      expect(sourceObject).not.toHaveProperty("mutateResult", true);
      expect(sourceObject).toEqual({
        test: "test"
      });
    });

    it("should return value for non-plain objects", () => {
      const reducer = ReducerConstant.create("string");
      const result = reducer.resolve();
      expect(result).toEqual("string");
      expect(mockCloneDeep).not.toBeCalled();
    });
  });
});
