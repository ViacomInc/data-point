const { ReducerConstant } = require("./constant");

describe("ReducerConstant", () => {
  describe("constructor", () => {
    it("should set type to 'constant'", () => {
      const reducer = new ReducerConstant("value");
      expect(reducer.type).toEqual("constant");
    });

    it("should set constantValue to source received", () => {
      const reducer = new ReducerConstant("value");
      expect(reducer.constantValue).toEqual("value");
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
      expect(reducer.type).toEqual("constant");
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

    it("should return deep cloned value", () => {
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
  });
});
