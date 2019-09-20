/* eslint-env jest */

const defineTest = require("jscodeshift/dist/testUtils").defineTest;

defineTest(
  __dirname,
  "hash-and-collection-execution-order",
  null,
  "hash-and-collection-execution-order"
);
