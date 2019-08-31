const mockValidate = jest.fn();

jest.mock("./validate", () => {
  return {
    validate: mockValidate
  };
});

const select = require("./select");
const { Reducer } = require("../../Reducer");
const { resolve } = require("../../resolve");
const { createReducer } = require("../../create-reducer");
const { Accumulator } = require("../../Accumulator");

function expectStatementsParsed(statements) {
  expect(statements).toBeInstanceOf(Array);

  statements.forEach(statement => {
    expect(statement.case).toBeInstanceOf(Reducer);
    expect(statement.do).toBeInstanceOf(Reducer);
  });
}

describe("parseCaseStatements", () => {
  it("should parse case statements", () => {
    const statements = select.parseCaseStatements([
      { case: () => true, do: () => true }
    ]);

    expectStatementsParsed(statements);
  });
});

describe("parseSelect", () => {
  it("should parse 'in' and 'default' properties", () => {
    const result = select.parseSelect({
      in: [{ case: () => true, do: () => true }],
      default: () => false
    });
    expectStatementsParsed(result.in);
    expect(result.default).toBeInstanceOf(Reducer);
  });
});

describe("getMatchingCaseStatement", () => {
  function createStatements() {
    return [
      {
        case: createReducer(value => value === "A")
      },

      {
        case: createReducer(value => value === "B")
      },

      {
        case: createReducer(value => value === "C")
      }
    ];
  }

  it("should return matching case/do object", async () => {
    const statements = createStatements();

    ["A", "B", "C"].forEach(async (letter, index) => {
      const acc = new Accumulator({
        value: letter
      });

      const matchingStatement = await select.getMatchingCaseStatement(
        statements,
        acc,
        resolve
      );

      expect(matchingStatement).toEqual(statements[index]);
    });
  });

  it("should return false if no match", async () => {
    const statements = createStatements();
    const acc = new Accumulator({
      value: "NO MATCH"
    });

    const result = await select.getMatchingCaseStatement(
      statements,
      acc,
      resolve
    );

    expect(result).toEqual(false);
  });
});

describe("ReducerSelect", () => {
  const ReducerSelect = select.ReducerSelect;

  const selectSpec = {
    in: [
      {
        case: value => value === "A",
        do: () => "isA"
      },
      {
        case: value => value === "B",
        do: () => "isB"
      }
    ],
    default: () => "isNone"
  };

  describe("constructor", () => {
    it("should validate input", () => {
      // eslint-disable-next-line no-unused-vars
      const reducer = new ReducerSelect(selectSpec);
      expect(mockValidate).toHaveBeenCalledWith(selectSpec);
    });

    it("should parse spec provided", () => {
      // eslint-disable-next-line no-unused-vars
      const reducer = new ReducerSelect(selectSpec);
      expect(reducer.select).toBeTruthy();
      expectStatementsParsed(reducer.select.in);
      expect(reducer.select.default).toBeInstanceOf(Reducer);
    });
  });

  describe("create", () => {
    it("should create instance of itself", () => {
      expect(ReducerSelect.create(selectSpec)).toBeInstanceOf(ReducerSelect);
    });
  });

  describe("resolve", () => {
    async function expectOutputToMatch(value, expectedOutput) {
      const reducer = new ReducerSelect(selectSpec);
      const acc = new Accumulator({
        value
      });
      const result = await reducer.resolve(acc, resolve);
      expect(result).toEqual(expectedOutput);
    }

    it("should return resolved 'do' of matching 'case'", async () => {
      await expectOutputToMatch("A", "isA");
      await expectOutputToMatch("B", "isB");
    });

    it("should return resolved default when no 'case' is matched", async () => {
      await expectOutputToMatch("C", "isNone");
    });
  });
});
