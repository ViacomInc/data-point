/* eslint-disable no-console */
const assert = require("assert");

const dataPoint = require("../").create();

dataPoint.addEntities({
  "entry:Base": {
    before: input => {
      return `${input}before`;
    },
    after: input => {
      return `${input}after`;
    }
  },

  // extends entry:Base
  "entry:Extended -> entry:Base": {
    // entry:Base's `before` and
    // `after` get merged with
    // this entity
    value: input => {
      return `${input} value `;
    }
  }
});

dataPoint.resolve("entry:Extended", "").then(output => {
  assert.strictEqual(output, "before value after");
  console.log(output);
});
