jest.mock("./unique-id-scope", () => {
  return () => () => "uniqueId";
});

const { Reducer, normalizeName } = require("./Reducer");
const { IS_REDUCER } = require("./reducer-symbols");

function createReducer() {
  return new Reducer("type", "name", "spec");
}

describe("normalizeName", () => {
  it("should append if provided", () => {
    expect(normalizeName("name")).toEqual("name:uniqueId");
  });

  it("should only return unique id value if name is not provided", () => {
    expect(normalizeName()).toEqual("uniqueId");
  });
});

describe("Reducer", () => {
  describe("constructor", () => {
    it("should set type name and spec", () => {
      const reducer = createReducer();
      expect(reducer).toMatchObject({
        type: "type",
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
