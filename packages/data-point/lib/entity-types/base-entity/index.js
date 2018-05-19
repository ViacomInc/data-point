/*
NOTE: exporting the resolve function here creates a circular dependency when it's
imported by reducer-entity/resolve.js -- to avoid this problem, that file imports
the resolve function directly from base-entity/resolve.js
*/

module.exports = {
  EntityFactory: require('./factory').EntityFactory,
  create: require('./factory').create
}
