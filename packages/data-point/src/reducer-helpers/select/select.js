const { Reducer } = require("../../Reducer");
const { createReducer } = require("../../create-reducer");
const { validate } = require("./validate");

/**
 * @typedef {Object} caseBlock
 * @property {Reducer} case
 * @property {Reducer} do
 */

/**
 * @typedef {Object} selectStatement
 * @property {caseBlock[]} in
 * @property {Reducer} default
 */

/**
 * Parse only case statements
 *
 * @param {{case:Reducer, do:Reducer}[]} spec un-parsed case statements
 * @returns {caseBlock[]}
 */
function parseCaseStatements(spec) {
  return spec.map(selectBlock => {
    return {
      case: createReducer(selectBlock.case),
      do: createReducer(selectBlock.do)
    };
  });
}

/**
 * @param {Object} select un-parsed select source
 * @param {{case:Reducer, do:Reducer}[]} select.in un-parsed case statements
 * @param {Reducer} select.default un-parsed case statements
 * @returns {selectStatement}
 */
function parseSelect(select) {
  return {
    in: parseCaseStatements(select.in),
    default: createReducer(select.default)
  };
}

/**
 * @param {{case:Reducer, do:Reducer}[]} caseStatements
 * @param {Accumulator} acc
 * @param {Function} resolveReducer
 * @return {Promise}
 */
async function getMatchingCaseStatement(caseStatements, acc, resolveReducer) {
  let statement;
  let caseMatched = false;

  for (let index = 0; index < caseStatements.length; index += 1) {
    statement = caseStatements[index];

    // we do purposely want to wait for each reducer to execute
    // eslint-disable-next-line no-await-in-loop
    const caseValue = await resolveReducer(acc, statement.case);

    if (caseValue) {
      caseMatched = true;
      break;
    }
  }

  if (caseMatched) {
    return statement;
  }

  return false;
}

/**
 * Mirrors a simplified behaviour of the `switch` statement in javascript.
 * It creates a reducer which accepts the form of:
 *
 * ```js
 * select({
 *   in: [
 *     { case: Reducer,  do: Reducer },
 *     { case: Reducer,  do: Reducer }
 *     ...
 *   ],
 *   default: Reducer
 * })
 * ```
 *
 * case blocks are executed sequentially, if a `case` returns a truthy value
 * its `do` statement will be resolved and returned.
 *
 * If no case matches then the `default` reducer will be resolved.
 */
class ReducerSelect extends Reducer {
  constructor(spec) {
    super(undefined, spec);
    validate(spec);
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
    const caseStatements = this.select.in;

    const matchedCaseStatement = await getMatchingCaseStatement(
      caseStatements,
      accumulator,
      resolveReducer
    );

    if (matchedCaseStatement) {
      return resolveReducer(accumulator, matchedCaseStatement.do);
    }

    return resolveReducer(accumulator, this.select.default);
  }
}

module.exports = {
  parseCaseStatements,
  parseSelect,
  getMatchingCaseStatement,
  ReducerSelect
};
