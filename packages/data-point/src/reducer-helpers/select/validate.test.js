const validate = require("./validate");

const dummyReducer = () => true;

describe("validateCaseBlock", () => {
  it("should handle missing 'case'", () => {
    expect(() =>
      validate.validateCaseBlock()
    ).toThrowErrorMatchingInlineSnapshot(
      `"'select' reducer is malformed, 'case' entry is missing. 'case/do' blocks must have a 'case' property."`
    );
  });

  it("should handle missing 'do'", () => {
    expect(() =>
      validate.validateCaseBlock({
        case: dummyReducer
      })
    ).toThrowErrorMatchingInlineSnapshot(
      `"'select' reducer is malformed, 'do' entry is missing. 'case/do' blocks must have a 'do' property."`
    );
  });

  it("should handle accidental 'default' entry", () => {
    expect(() =>
      validate.validateCaseBlock({
        case: dummyReducer,
        do: dummyReducer,
        default: dummyReducer
      })
    ).toThrowErrorMatchingInlineSnapshot(
      `"'select' reducer is malformed, 'case/do' entry must not contain a 'default' property."`
    );
  });

  it("should not throw errors if well formed", () => {
    expect(() =>
      validate.validateCaseBlock({
        case: dummyReducer,
        do: dummyReducer
      })
    ).not.toThrow();
  });
});

describe("validateInProperty", () => {
  it("should test for empty", () => {
    expect(() =>
      validate.validateInProperty()
    ).toThrowErrorMatchingInlineSnapshot(
      `"'select' reducer definition must contain 'in' property."`
    );
  });
  it("should test for array", () => {
    expect(() =>
      validate.validateInProperty("emptyString")
    ).toThrowErrorMatchingInlineSnapshot(
      `"'select' reducer definition 'in' property must be an Array."`
    );
  });

  it("should test for non-empty array", () => {
    expect(() =>
      validate.validateInProperty([])
    ).toThrowErrorMatchingInlineSnapshot(
      `"'select' reducer definition should not be empty."`
    );
  });

  it("should validate in cases", () => {
    expect(() =>
      validate.validateInProperty([
        {
          case: undefined
        }
      ])
    ).toThrowErrorMatchingInlineSnapshot(
      `"'select' reducer is malformed, 'case' entry is missing. 'case/do' blocks must have a 'case' property."`
    );
  });

  it("should should not throw if valid", () => {
    expect(() => {
      validate.validateInProperty([
        {
          case: dummyReducer,
          do: dummyReducer
        }
      ]);
    }).not.toThrow();
  });
});

describe("validateDefaultProperty", () => {
  it("should handle non empty", () => {
    expect(() =>
      validate.validateDefaultProperty()
    ).toThrowErrorMatchingInlineSnapshot(
      `"'select' reducer definition must contain a 'default' property."`
    );
  });

  it("should handle non empty", () => {
    expect(() => validate.validateDefaultProperty(dummyReducer)).not.toThrow();
  });
});

describe("validate", () => {
  it("should handle empty input", () => {
    expect(() => validate.validate()).toThrowErrorMatchingInlineSnapshot(
      `"'select' reducer definition must contain 'in' property."`
    );
  });

  it("should validate default property", () => {
    expect(() =>
      validate.validate({
        in: [
          {
            case: dummyReducer,
            do: dummyReducer
          }
        ]
      })
    ).toThrowErrorMatchingInlineSnapshot(
      `"'select' reducer definition must contain a 'default' property."`
    );
  });

  it("should validate well formed select", () => {
    expect(() =>
      validate.validate({
        in: [
          {
            case: dummyReducer,
            do: dummyReducer
          }
        ],
        default: dummyReducer
      })
    ).not.toThrow();
  });
});
