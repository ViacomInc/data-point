//
// var tv4 = require('tv4');
// var R = require('ramda');
// var cjson = require('cjson');
//
// var settings = {
//   assetsPath: 'test/assets/'
// };
//
// function getJSON(target) {
//   var targetData = target;
//
//   if (R.type(target) === 'string') {
//     return cjson.load(settings.assetsPath + target);
//   }
//
//   return target;
// }
//
// function validate(target, schema) {
//   var targetData = getJSON(target);
//   var schemaData = getJSON(schema);
//
//   var result = tv4.validateResult(targetData, schemaData);
//
//   if (result.valid) {
//     return true;
//   } else {
//     throw result.error;
//   }
//
// }
//
// module.exports.validate = validate;
