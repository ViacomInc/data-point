const { Reducer, normalizeName } = require("./Reducer");
const { IS_REDUCER } = require("./reducer-symbols");

function createReducer() {
  return new Reducer("name", "spec");
}

describe("normalizeName", () => {
  it("should add postfix", () => {
    expect(normalizeName("name")).toEqual("name:");
  });
});

describe("Reducer", () => {
  describe("constructor", () => {
    it("should set type name and spec", () => {
      const reducer = createReducer();
      expect(reducer).toMatchObject({
        name: "name",
        spec: "spec"
      });
    });

    it("should set spec as not enumerable", () => {
      const reducer = createReducer();
      expect(Object.prototype.propertyIsEnumerable.call(reducer, "spec")).toBe(
        false
      );
    });

    it("should set IS_REDUCER property as not enumerable", () => {
      const reducer = createReducer();
      expect(reducer[IS_REDUCER]).toBe(true);
      expect(
        Object.prototype.propertyIsEnumerable.call(reducer, IS_REDUCER)
      ).toBe(false);
    });
  });

  describe("isReducer", () => {
    it("should check if an object is a reducer or not", async () => {
      const reducer = createReducer();

      expect(Reducer.isReducer(reducer)).toEqual(true);
      expect(Reducer.isReducer({})).toEqual(false);
      expect(Reducer.isReducer(undefined)).toEqual(false);
    });
  });

  describe("resolveReducer", () => {
    it("should call resolve method", async () => {
      const reducer = createReducer();
      reducer.resolve = jest.fn(() => "resolved");
      const result = await reducer.resolveReducer("acc", "resolveReducer");
      expect(reducer.resolve).toBeCalledWith("acc", "resolveReducer");
      expect(result).toEqual("resolved");
    });
  });
});
