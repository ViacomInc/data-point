const NS_PER_SEC = 1e9

module.exports.NS_PER_SEC = NS_PER_SEC

const NS_PER_MS = 1000000

module.exports.NS_PER_MS = NS_PER_MS

/**
 * @param {Number} nano nanoseconds
 * @returns {Number} milliseconds
 */
function nanoToMillisecond (nano) {
  return nano / NS_PER_MS
}

module.exports.nanoToMillisecond = nanoToMillisecond

/**
 * @param {hrtime} time hrtime value
 * @returns {Integer} nanosecond
 */
function hrtimeTotNanosec (time) {
  return time[0] * NS_PER_SEC + time[1]
}

module.exports.hrtimeTotNanosec = hrtimeTotNanosec

/**
 * @param {hrtime} time hrtime value
 * @returns {Integer} duration between time argument and current time
 */
function getDuration (time) {
  const diff = process.hrtime(time)
  const nanosec = hrtimeTotNanosec(diff)
  return nanosec
}

module.exports.getDuration = getDuration
