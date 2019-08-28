function validateCaseBlock(caseBlock = {}) {
  if (!caseBlock.case) {
    throw new Error(
      "'select' reducer is malformed, 'case' entry is missing. 'case/do' blocks must have a 'case' property."
    );
  }

  if (!caseBlock.do) {
    throw new Error(
      "'select' reducer is malformed, 'do' entry is missing. 'case/do' blocks must have a 'do' property."
    );
  }

  // for accidental bad copy pastes from users
  if (caseBlock.default) {
    throw new Error(
      "'select' reducer is malformed, 'case/do' entry must not contain a 'default' property."
    );
  }
}

function validateInProperty(inEntry) {
  if (!inEntry) {
    throw new Error("'select' reducer definition must contain 'in' property.");
  }

  if (!Array.isArray(inEntry)) {
    throw new Error(
      "'select' reducer definition 'in' property must be an Array."
    );
  }

  if (!inEntry.length) {
    throw new Error("'select' reducer definition should not be empty.");
  }

  inEntry.forEach(validateCaseBlock);
}

function validateDefaultProperty(defaultReducer) {
  if (!defaultReducer) {
    throw new Error(
      "'select' reducer definition must contain a 'default' property."
    );
  }
}

function validate(select = {}) {
  validateInProperty(select.in);
  validateDefaultProperty(select.default);
}

module.exports = {
  validateCaseBlock,
  validateInProperty,
  validateDefaultProperty,
  validate
};
