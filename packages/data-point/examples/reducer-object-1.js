const dataPoint = require("../").create();

const reducer = {
  y: "$x.y",
  zPlusOne: ["$x.y.z", input => input + 1]
};

const data = {
  x: {
    y: {
      z: 2
    }
  }
};

dataPoint.resolve(reducer, data).then(output => {
  console.log(output);
});
