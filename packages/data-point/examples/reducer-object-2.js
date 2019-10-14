/* eslint-disable no-console */
const dataPoint = require("../").create();

const reducer = {
  x: "$c.x",
  y: "$c.y",
  z: {
    a: "$a",
    b: "$b"
  }
};

const data = {
  a: "A",
  b: "B",
  c: {
    x: "X",
    y: "Y"
  }
};

dataPoint.resolve(reducer, data).then(output => {
  console.log(output);
});
