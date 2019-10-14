/* eslint-env jest */

const jscodeshift = require("jscodeshift");

const defineTest = require("jscodeshift/dist/testUtils").defineTest;
const transform = require("../../transforms/reducer-args-acc-to-val-acc");

defineTest(
  __dirname,
  "reducer-args-acc-to-val-acc",
  null,
  "reducer-args-acc-to-val-acc"
);

it("throws variable value is already in scope", () => {
  const source = `
    const f = input = acc => {
      return input + acc.value
    }
  `;

  expect(() => transform({ source }, { jscodeshift }, {})).toThrowError();
});
