function verify(options) {
  if (!options.DataPoint) {
    throw new Error("DataPoint module must be provided");
  }

  return options;
}

function createDataPoint(options) {
  const DataPoint = options.DataPoint;
  const dataPoint = DataPoint.create(options);
  return dataPoint;
}

async function create(options) {
  verify(options);
  return createDataPoint(options);
}

module.exports = {
  verify,
  createDataPoint,
  create
};
