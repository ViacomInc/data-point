/* eslint global-require: 0 */

module.exports = Object.assign({}, require('./helpers'), require('../utils'))

module.exports.createTransform = require('../reducer-types').create
