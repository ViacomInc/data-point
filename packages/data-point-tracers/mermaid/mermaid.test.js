const fs = require("fs").promises;
const { getParent, getName, graphTD, Mermaid } = require("./mermaid");

function createChildSpan(name, pid, parent) {
  return {
    name,
    parent,
    context: {
      pid
    }
  };
}

function createSampleSpans() {
  const aa = createChildSpan("aa", 1);
  aa.root = true;
  const bb = createChildSpan("bb", 2, aa);
  const cc = createChildSpan("cc", 3, aa);
  const dd = createChildSpan("dd", 4, bb);

  const spans = [aa, bb, cc, dd];

  return spans;
}

const graphResult = `graph TD;
  root-->aa1
  aa1-->bb2
  aa1-->cc3
  bb2-->dd4`;

describe("getParent", () => {
  it("should return `root` if root flag is true", () => {
    expect(getParent({ root: true })).toEqual("root");
  });
  it("should return parent if root flag not true", () => {
    expect(getParent({ parent: "parent" })).toEqual("parent");
  });
});

describe("getName", () => {
  it("should return 'root' if span is root", () => {
    expect(getName("root")).toEqual("root");
  });
  it("should return constructed name if span is not root", () => {
    const span = createChildSpan("name", 1);
    expect(getName(span)).toEqual("name1");
  });
});

describe("graphTD", () => {
  it("should create graph tree", () => {
    const result = graphTD(createSampleSpans());
    expect(result).toEqual(graphResult);
  });
});

describe("Mermaid", () => {
  describe("constructor", () => {
    it("should create spans array", () => {
      const result = new Mermaid();
      expect(result).toHaveProperty("spans", []);
    });
  });

  describe("create", () => {
    it("should have static method to create new instance", () => {
      const result = Mermaid.create();
      expect(result).toBeInstanceOf(Mermaid);
    });
  });

  describe("start", () => {
    it("should track spans", () => {
      const result = new Mermaid();
      result.start("span");
      expect(result.spans).toEqual(["span"]);
    });
  });

  describe("report", () => {
    it("should create and return mermaid graph", async () => {
      const result = new Mermaid();
      result.spans = createSampleSpans();
      expect(await result.report()).toEqual(graphResult);
    });

    it("should save to file", async () => {
      const result = new Mermaid();
      result.spans = createSampleSpans();

      const spyWriteFile = jest.spyOn(fs, "writeFile").mockResolvedValue(true);

      await result.report("/test.mer");
      expect(spyWriteFile).toBeCalledWith("/test.mer", graphResult);
    });
  });
});
