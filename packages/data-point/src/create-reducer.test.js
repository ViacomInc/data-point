const createReducer = require("./create-reducer");
const { IS_REDUCER } = require("./reducer-symbols");

const shallowReducer = {
  [IS_REDUCER]: true
};

describe("isReducer", () => {
  it("should if parameter is a reducer", () => {
    expect(createReducer.isReducer(undefined)).toEqual(false);
    expect(createReducer.isReducer({})).toEqual(false);
    expect(createReducer.isReducer(shallowReducer)).toEqual(true);
  });
});

// checking both functions in here because one calls the other recursively
describe("createReducer/getReducer", () => {
  it("should throw error for invalid ", () => {
    expect(() => {
      createReducer.createReducer(undefined);
    }).toThrowErrorMatchingInlineSnapshot(
      `"Reducer provided was not recognized"`
    );
  });

  it("should check if parameter is already a reducer and return it ", () => {
    expect(createReducer.createReducer(shallowReducer)).toEqual(shallowReducer);
  });

  it("should create function reducer", () => {
    const reducer = createReducer.createReducer(() => true);
    expect(reducer).toHaveProperty("type", "function");
  });

  it("should create path reducer", () => {
    const reducer = createReducer.createReducer("$a[7]");
    expect(reducer).toHaveProperty("type", "path");
  });

  it("should create list reducer", () => {
    const reducer = createReducer.createReducer([]);
    expect(reducer).toHaveProperty("type", "list");
  });

  it("should create object reducer", () => {
    const reducer = createReducer.createReducer({});
    expect(reducer).toHaveProperty("type", "object");
  });
});
