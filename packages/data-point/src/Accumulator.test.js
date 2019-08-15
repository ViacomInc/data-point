const { Accumulator } = require("./Accumulator");

describe("Accumulator", () => {
  describe("constructor", () => {
    it("should accept empty options object", () => {
      expect(new Accumulator()).toEqual({});
    });
    it("should assign options object", () => {
      const resolve = () => true;
      expect(
        new Accumulator({
          value: "value",
          locals: "locals",
          cache: "cache",
          tracer: "tracer",
          resolve
        })
      ).toMatchObject({
        value: "value",
        locals: "locals",
        cache: "cache",
        tracer: "tracer",
        __resolve: resolve
      });
    });
  });

  describe("create", () => {
    it("should create new object", () => {
      const acc1 = new Accumulator({
        value: "a"
      });
      const acc2 = acc1.create();
      expect(Object.getPrototypeOf(acc2)).toEqual(acc1);
    });
  });

  describe("set", () => {
    it("should create new object and assign property/value", () => {
      const acc1 = new Accumulator({
        value: "a"
      });
      const acc2 = acc1.set("value", "b");
      expect(acc1.value).toEqual("a");
      expect(acc2.value).toEqual("b");
      expect(Object.getPrototypeOf(acc2)).toEqual(acc1);
    });
  });
  describe("resolve", () => {
    it("should call internal resolve method", () => {
      const mockResolve = jest.fn(() => "resolved");
      const acc = new Accumulator({
        value: "a",
        resolve: mockResolve
      });

      const result = acc.resolve("reducers");
      expect(result).toEqual("resolved");
      expect(mockResolve).toBeCalledWith(acc, "reducers");
    });
  });
});
