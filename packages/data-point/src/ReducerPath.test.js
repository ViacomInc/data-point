const reducerPath = require("./ReducerPath");
const { Accumulator } = require("./Accumulator");

const value = {
  a: {
    b: [
      [
        {
          c: "c"
        }
      ]
    ]
  },
  e: ["", false, null, 0]
};

describe("splitToArrayRegEx", () => {
  it("should split dots and bracket notation", () => {
    const testString = "aaa.11.rt.43.[1].a.[8][abc][9]";
    const result = testString.split(reducerPath.splitToArrayRegEx);
    expect(result).toEqual([
      "aaa",
      "11",
      "rt",
      "43",
      "",
      "1",
      "",
      "a",
      "",
      "8",
      "",
      "abc",
      "",
      "9",
      ""
    ]);
  });
});

describe("parsePathProperty", () => {
  it("should leave as string if value cant be converted to number", () => {
    expect(reducerPath.parsePathProperty("ab2")).toEqual("ab2");
  });

  it("should parse to number if string can be parsed to number", () => {
    expect(reducerPath.parsePathProperty("2")).toEqual(2);
  });
});

describe("stringToPath", () => {
  it("should parse dot notation into array of strings and numbers", () => {
    expect(reducerPath.stringToPath("a.b.c[9][7][bb].r[o]")).toEqual([
      "a",
      "b",
      "c",
      9,
      7,
      "bb",
      "r",
      "o"
    ]);
  });
});

describe("parsePath", () => {
  it("should parse $.", () => {
    expect(reducerPath.parsePath("$.")).toMatchObject({
      useAccumulatorAsSource: false,
      path: []
    });
  });

  it("should parse $..", () => {
    expect(reducerPath.parsePath("$..")).toMatchObject({
      useAccumulatorAsSource: true,
      path: []
    });

    expect(reducerPath.parsePath("$..locals.a")).toMatchObject({
      useAccumulatorAsSource: true,
      path: ["locals", "a"]
    });
  });

  it("should parse $a.b", () => {
    expect(reducerPath.parsePath("$a.b")).toMatchObject({
      useAccumulatorAsSource: false,
      path: ["a", "b"]
    });
  });
});

describe("crawlPath", () => {
  it("should get current value if array is empty", () => {
    expect(reducerPath.crawlPath(value, [])).toEqual(value);
  });

  it("should get value inside path", () => {
    expect(reducerPath.crawlPath(value, ["a"])).toEqual(value.a);
    expect(reducerPath.crawlPath(value, ["a", "b"])).toEqual(value.a.b);
    expect(reducerPath.crawlPath(value, ["a", "b", 0, 0])).toEqual(
      value.a.b[0][0]
    );
    expect(reducerPath.crawlPath(value, ["a", "b", 0, 0, "c"])).toEqual(
      value.a.b[0][0].c
    );
  });

  it("should resolve properties of values", () => {
    expect(reducerPath.crawlPath(value, ["e", "length"])).toEqual(
      value.e.length
    );
    expect(reducerPath.crawlPath(value, ["e", 0, "length"])).toEqual(
      value.e[0].length
    );
  });

  it("should resolve falsy values", () => {
    // empty string
    expect(reducerPath.crawlPath(value, ["e", 0])).toEqual(value.e[0]);
    // false
    expect(reducerPath.crawlPath(value, ["e", 1])).toEqual(value.e[1]);
    // false.toString === toString (function)
    expect(reducerPath.crawlPath(value, ["e", 1, "toString"])).toBeInstanceOf(
      Function
    );
    // null
    expect(reducerPath.crawlPath(value, ["e", 2])).toEqual(value.e[2]);
    // null.toString === null
    expect(reducerPath.crawlPath(value, ["e", 2, "toString"])).toEqual(null);
    // 0
    expect(reducerPath.crawlPath(value, ["e", 3])).toEqual(value.e[3]);
  });

  it("should return undefined for invalid values", () => {
    expect(reducerPath.crawlPath(value, ["a", "invalid"])).toEqual(undefined);
    // out of range index
    expect(reducerPath.crawlPath(value, ["e", 5])).toEqual(undefined);
  });
});

describe("resolvePath", () => {
  it("should use accumulator if useAccumulatorAsSource flag is true", () => {
    const acc = new Accumulator({
      value,
      locals: {
        myLocal: "myLocal"
      }
    });

    const compiledPath = {
      useAccumulatorAsSource: true,
      path: ["locals", "myLocal"]
    };
    expect(reducerPath.resolvePath(acc, compiledPath)).toEqual("myLocal");
  });

  it("should use accumulator.value if useAccumulatorAsSource flag is false", () => {
    const acc = new Accumulator({
      value
    });

    const compiledPath = {
      useAccumulatorAsSource: false,
      path: ["a", "b"]
    };
    expect(reducerPath.resolvePath(acc, compiledPath)).toEqual(value.a.b);
  });
});

describe("ReducerPath", () => {
  const ReducerPath = reducerPath.ReducerPath;
  const pathSrc = "$a.b[1][5].c";
  describe("constructor", () => {
    it("should set compiledPath property", () => {
      const result = new ReducerPath(pathSrc);
      expect(result.compiledPath).toMatchObject({
        useAccumulatorAsSource: false,
        path: ["a", "b", 1, 5, "c"]
      });
    });

    it("should use function's name as the reducer's name", () => {
      const result = new ReducerPath(pathSrc);
      expect(result.name).toEqual(pathSrc);
    });
  });

  describe("isType", () => {
    it("should check is path", () => {
      expect(ReducerPath.isType(0)).toEqual(false);
      expect(ReducerPath.isType("")).toEqual(false);
      expect(ReducerPath.isType("$")).toEqual(false);
      expect(ReducerPath.isType("$.")).toEqual(true);
      expect(ReducerPath.isType("$1")).toEqual(true);
      expect(ReducerPath.isType("$a")).toEqual(true);
    });
  });

  describe("resolve", () => {
    it("should resolve compiled string from accumulator's value", () => {
      const result = new ReducerPath("$a.b");
      const acc = new Accumulator({
        value
      });
      expect(result.resolve(acc)).toEqual(value.a.b);
    });
  });
});
