const uniqueIdScope = require("./unique-id-scope");

describe("create scoped unique id generator", () => {
  it("should generate independent unique ids per scope", () => {
    const scope1 = uniqueIdScope();
    const scope2 = uniqueIdScope();
    expect(scope1()).toEqual(1);
    expect(scope1()).toEqual(2);
    expect(scope2()).toEqual(1);
    expect(scope2()).toEqual(2);
  });
});
