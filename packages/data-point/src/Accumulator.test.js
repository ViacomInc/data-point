const { Accumulator } = require("./Accumulator");

describe("Accumulator", () => {
  describe("constructor", () => {
    it("should accept empty options object", () => {
      expect(new Accumulator()).toMatchInlineSnapshot(`
                Accumulator {
                  "cache": Object {},
                  "locals": undefined,
                  "tracer": undefined,
                  "value": undefined,
                }
            `);
    });
    it("should assign options object", () => {
      const resolve = () => true;
      const acc = new Accumulator({
        value: "value",
        locals: "locals",
        cache: "cache",
        tracer: "tracer",
        resolve
      });
      expect(acc).toMatchInlineSnapshot(`
        Accumulator {
          "cache": "cache",
          "locals": "locals",
          "tracer": "tracer",
          "value": "value",
        }
      `);

      // eslint-disable-next-line no-underscore-dangle
      expect(acc.__resolve).toEqual(resolve);
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
