const { Reducer } = require("../../Reducer");
const { createReducer } = require("../../create-reducer");

/**
 * Parse only case statements
 *
 * @param {hash} spec - key/value where each value will be mapped into a reducer
 * @returns
 */
function parseCaseStatements(spec) {
  return spec.reduce((acc, selectBlock) => {
    if (selectBlock.default !== undefined) {
      return acc;
    }

    acc.push({
      case: createReducer(selectBlock.case),
      do: createReducer(selectBlock.do)
    });

    return acc;
  }, []);
}

function validateCaseBlock(id, caseBlock) {
  if (caseBlock.case === undefined) {
    throw new Error(
      `"${id}" is malformed, "case" entry is missing. Select case blocks must have a "case" reducer set.`
    );
  }

  if (caseBlock.do === undefined) {
    throw new Error(
      `"${id}" is malformed, "do" entry is missing. Select case blocks must have a "do" reducer set.`
    );
  }
}

function validateDefaultBlock(id, defaultBlock) {
  if (!defaultBlock.default) {
    throw new Error(
      `"${id}" is malformed, it is missing a "default" case. Select must have it's "default" statement handled.`
    );
  }
}

function validate(id, select) {
  if (!select.length) {
    throw new Error(`"${id}" should not be empty.`);
  }
  select.forEach(selectBlock => {
    if (selectBlock.case) {
      validateCaseBlock(id, selectBlock);
    } else {
      validateDefaultBlock(id, selectBlock);
    }
  });
}

/**
 * @param {string} id reducer id
 * @param {Array} select
 */
function parseDefaultStatement(select) {
  const defaultCase = select.find(statement => {
    return statement.default;
  });

  return createReducer(defaultCase.default);
}

/**
 * parse spec
 *
 * @param {any} spec
 * @returns
 */
function parseSelect(select) {
  return {
    cases: parseCaseStatements(select),
    default: parseDefaultStatement(select)
  };
}

/**
 * @param {Array<Object>} caseStatements
 * @param {Accumulator} acc
 * @param {Function} resolveReducer
 * @return {Promise}
 */
async function getMatchingCaseStatement(caseStatements, acc, resolveReducer) {
  let statement;
  let statementIndex = 0;
  let caseMatched = false;

  while (statementIndex < caseStatements.length) {
    statement = caseStatements[statementIndex];

    // we do purposely want to wait for each reducer to execute
    // eslint-disable-next-line no-await-in-loop
    const caseValue = await resolveReducer(acc, statement.case);

    if (caseValue === true) {
      caseMatched = true;
      break;
    }

    statementIndex += 1;
  }

  if (caseMatched) {
    return statement;
  }

  return false;
}

class ReducerSelect extends Reducer {
  constructor(spec) {
    super("select", undefined, spec);
    validate(this.id, spec);
    this.select = parseSelect(spec);
  }

  static create(spec) {
    return new ReducerSelect(spec);
  }

  /**
   * @param {Accumulator} accumulator
   * @param {Function} resolveReducer
   * @returns {Promise}
   */
  async resolve(accumulator, resolveReducer) {
    const { caseStatements, defaultTransform } = this.select.cases;

    const matchedCaseStatement = await getMatchingCaseStatement(
      caseStatements,
      accumulator,
      resolveReducer
    );

    if (matchedCaseStatement) {
      return resolveReducer(accumulator, matchedCaseStatement.do);
    }

    return resolveReducer(accumulator, defaultTransform);
  }
}

module.exports = {
  ReducerSelect
};
