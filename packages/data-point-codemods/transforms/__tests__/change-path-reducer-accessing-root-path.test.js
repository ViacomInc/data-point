/* eslint-env jest */

const { defineTest } = require("jscodeshift/dist/testUtils");

// single quote
defineTest(
  __dirname,
  "change-path-reducer-accessing-root-path",
  null,
  "change-path-reducer-accessing-root-path-single-quote"
);

// double quote
defineTest(
  __dirname,
  "change-path-reducer-accessing-root-path",
  null,
  "change-path-reducer-accessing-root-path-double-quote"
);
