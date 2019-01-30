function verify (options) {
  if (!options.DataPoint) {
    throw new Error('DataPoint module must be provided')
  }

  return options
}

function createDataPoint (options) {
  const DataPoint = options.DataPoint
  const dataPoint = DataPoint.create(options)
  return dataPoint
}

function create (options) {
  return Promise.resolve(options)
    .then(verify)
    .then(createDataPoint)
}

module.exports = {
  verify,
  createDataPoint,
  create
}
