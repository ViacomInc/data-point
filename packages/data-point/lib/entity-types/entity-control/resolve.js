/**
 *
 * @param {Array<Object>} caseStatements
 * @param {Accumulator} acc
 * @param {Function} resolveReducer
 * @return {Promise}
 */
async function getMatchingCaseStatement(caseStatements, acc, resolveReducer) {
  for (let index = 0; index < caseStatements.length; index += 1) {
    const statement = caseStatements[index];

    // eslint-disable-next-line no-await-in-loop
    const value = await resolveReducer(acc, statement.case);
    if (value) {
      return statement;
    }
  }

  return undefined;
}
module.exports.getMatchingCaseStatement = getMatchingCaseStatement;

/**
 * @param {Accumulator} acc
 * @param {Function} resolveReducer
 * @return {Promise}
 */
async function resolve(acc, resolveReducer) {
  const selectControl = acc.reducer.spec.select;
  const caseStatements = selectControl.cases;
  const defaultTransform = selectControl.default;

  const caseStatement = await getMatchingCaseStatement(
    caseStatements,
    acc,
    resolveReducer
  );

  if (caseStatement) {
    return resolveReducer(acc, caseStatement.do);
  }

  return resolveReducer(acc, defaultTransform);
}

module.exports.resolve = resolve;
