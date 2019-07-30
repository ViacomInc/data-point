# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.4.3](https://github.com/ViacomInc/data-point/compare/data-point@3.4.2...data-point@3.4.3) (2019-07-30)


### Bug Fixes

* Fix bug when the input to a reducer list is undefined ([#354](https://github.com/ViacomInc/data-point/issues/354)) ([82c3b95](https://github.com/ViacomInc/data-point/commit/82c3b95)), closes [#353](https://github.com/ViacomInc/data-point/issues/353)





## [3.4.2](https://github.com/ViacomInc/data-point/compare/data-point@3.4.1...data-point@3.4.2) (2019-07-15)

**Note:** Version bump only for package data-point





<a name="3.4.1"></a>
## [3.4.1](https://github.com/ViacomInc/data-point/compare/data-point@3.4.1-1...data-point@3.4.1) (2019-07-10)




**Note:** Version bump only for package data-point

<a name="3.4.0"></a>
# [3.4.0](https://github.com/ViacomInc/data-point/compare/data-point@3.3.2-1...data-point@3.4.0) (2018-12-19)


### Features

* **base-entity:** Do not freeze entity instances ([#300](https://github.com/ViacomInc/data-point/issues/300)) ([84aa093](https://github.com/ViacomInc/data-point/commit/84aa093)), closes [#299](https://github.com/ViacomInc/data-point/issues/299)
* **data-point:** improved tracing mechanism ([#302](https://github.com/ViacomInc/data-point/issues/302)) ([01ebaad](https://github.com/ViacomInc/data-point/commit/01ebaad)), closes [#301](https://github.com/ViacomInc/data-point/issues/301)




<a name="3.3.1"></a>
## [3.3.1](https://github.com/ViacomInc/data-point/compare/data-point@3.3.0...data-point@3.3.1) (2018-05-11)


### Bug Fixes

* **data-point:** fix request.params.inspect ([#283](https://github.com/ViacomInc/data-point/issues/283)) ([633b514](https://github.com/ViacomInc/data-point/commit/633b514)), closes [#263](https://github.com/ViacomInc/data-point/issues/263)




<a name="3.3.0"></a>
# 3.3.0 (2018-05-07)


### Bug Fixes

* **data-point:** fix entity id display on traces ([#278](https://github.com/ViacomInc/data-point/issues/278)) ([21429f3](https://github.com/ViacomInc/data-point/commit/21429f3)), closes [#277](https://github.com/ViacomInc/data-point/issues/277)



<a name="3.2.0"></a>
# 3.2.0 (2018-05-02)


### Bug Fixes

* **data-point:** Allow find reducers to return falsy values ([#257](https://github.com/ViacomInc/data-point/issues/257)) ([4fe693b](https://github.com/ViacomInc/data-point/commit/4fe693b)), closes [#256](https://github.com/ViacomInc/data-point/issues/256)


### Features

* **data-point:** Add createTypeCheckReducer to public API ([#251](https://github.com/ViacomInc/data-point/issues/251)) ([cd10bf6](https://github.com/ViacomInc/data-point/commit/cd10bf6)), closes [#247](https://github.com/ViacomInc/data-point/issues/247)
* **data-point:** Replace _.partial with Array.bind ([#260](https://github.com/ViacomInc/data-point/issues/260)) ([5d4675e](https://github.com/ViacomInc/data-point/commit/5d4675e))
* **data-point:** Replace the Locals class with a plain object ([#254](https://github.com/ViacomInc/data-point/issues/254)) ([a379930](https://github.com/ViacomInc/data-point/commit/a379930))
* **data-point-service:** adds staleWhileRevalidate feature ([#267](https://github.com/ViacomInc/data-point/issues/267)) ([a121249](https://github.com/ViacomInc/data-point/commit/a121249)), closes [#265](https://github.com/ViacomInc/data-point/issues/265)



<a name="3.1.0"></a>
# 3.1.0 (2018-03-07)


### Features

* **data-point:** Add entity factories ([#238](https://github.com/ViacomInc/data-point/issues/238)) ([c9acf7d](https://github.com/ViacomInc/data-point/commit/c9acf7d))
* **data-point:** Expose createReducer on DataPoint object ([#234](https://github.com/ViacomInc/data-point/issues/234)) ([41eb42a](https://github.com/ViacomInc/data-point/commit/41eb42a)), closes [#233](https://github.com/ViacomInc/data-point/issues/233)
* Address todo comments regarding object mutation ([#239](https://github.com/ViacomInc/data-point/issues/239)) ([a6b8318](https://github.com/ViacomInc/data-point/commit/a6b8318))



<a name="3.0.0"></a>
# 3.0.0 (2018-02-26)


### Bug Fixes

* **reducer-list:** ReducerList factory now throws an error for falsy input ([#212](https://github.com/ViacomInc/data-point/issues/212)) ([2c65794](https://github.com/ViacomInc/data-point/commit/2c65794)), closes [#188](https://github.com/ViacomInc/data-point/issues/188)


### Features

* **data-point:** Normalize collection and hash type checking functionality ([#214](https://github.com/ViacomInc/data-point/issues/214)) ([d083cd1](https://github.com/ViacomInc/data-point/commit/d083cd1)), closes [#189](https://github.com/ViacomInc/data-point/issues/189)
* **data-point:** Refactor behavior of find, filter, and empty reducers ([#207](https://github.com/ViacomInc/data-point/issues/207)) ([1a80a47](https://github.com/ViacomInc/data-point/commit/1a80a47)), closes [#122](https://github.com/ViacomInc/data-point/issues/122) [#176](https://github.com/ViacomInc/data-point/issues/176)
* **data-point:** Remove predefined hash and collection execution order ([#218](https://github.com/ViacomInc/data-point/issues/218)) ([8fc75c1](https://github.com/ViacomInc/data-point/commit/8fc75c1)), closes [#73](https://github.com/ViacomInc/data-point/issues/73)
* **data-point-codemod:** adds codemod package ([#172](https://github.com/ViacomInc/data-point/issues/172)) ([8ac4f37](https://github.com/ViacomInc/data-point/commit/8ac4f37)), closes [#117](https://github.com/ViacomInc/data-point/issues/117)
* **data-point/entity-request:** Resolve EntityRequest#options with a reducer ([#163](https://github.com/ViacomInc/data-point/issues/163)) ([02efbf9](https://github.com/ViacomInc/data-point/commit/02efbf9))
* **data-point/helpers:** Do not export type checking functions ([#220](https://github.com/ViacomInc/data-point/issues/220)) ([6e54252](https://github.com/ViacomInc/data-point/commit/6e54252)), closes [#215](https://github.com/ViacomInc/data-point/issues/215)
* **data-point/reducer-parallel:** Add ReducerParallel type ([#191](https://github.com/ViacomInc/data-point/issues/191)) ([485f4ab](https://github.com/ViacomInc/data-point/commit/485f4ab)), closes [#168](https://github.com/ViacomInc/data-point/issues/168)
* **data-point/reducer-path:** Add a custom name to ReducerPath#body functions ([#193](https://github.com/ViacomInc/data-point/issues/193)) ([6aab266](https://github.com/ViacomInc/data-point/commit/6aab266)), closes [#182](https://github.com/ViacomInc/data-point/issues/182)
* **data-point/reducer-types:** Add the ReducerConstant type ([#173](https://github.com/ViacomInc/data-point/issues/173)) ([7a95d38](https://github.com/ViacomInc/data-point/commit/7a95d38))


### BREAKING CHANGES

* **reducer-list:** Anything relying on putting a falsy, non-string value into ReducerList will now
throw an error
* **data-point:** No longer possible to use multiple modifiers without a compose array
* **data-point:** ReducerPick with no keys resolves to an empty object; empty ReducerLists resolve to undefined; empty ReducerObjects resolve to empty objects
* **data-point-codemod:** every reducer function needs to be changed to accept the first parameter as the
reducer's input, use codemods provided
* **data-point/entity-request:** EntityRequest#options must be defined as a reducer instead of a TransformObject

* feat(data-point/entity-request): Remove support for EntityRequest#beforeRequest

this is no longer necessary because options is now a reducer
* **data-point/entity-request:** removes EntityRequest#beforeRequest from the API



<a name="2.0.0"></a>
# 2.0.0 (2018-01-21)


### Bug Fixes

* **core/factory:** Add default options.entityTypes object ([#84](https://github.com/ViacomInc/data-point/issues/84)) ([d967388](https://github.com/ViacomInc/data-point/commit/d967388))
* **reducer-path/factory:** Use default when ReducerPath.name is empty string ([#97](https://github.com/ViacomInc/data-point/issues/97)) ([50a25aa](https://github.com/ViacomInc/data-point/commit/50a25aa))


* Entities skip if empty should error (#118) ([a1c6476](https://github.com/ViacomInc/data-point/commit/a1c6476)), closes [#45](https://github.com/ViacomInc/data-point/issues/45)
* refactor(data-point) Refactor references of transform to reducer ([ff00ba8](https://github.com/ViacomInc/data-point/commit/ff00ba8))


### Features

* **data-point:** explicitly expose set of methods to the main API ([870b36f](https://github.com/ViacomInc/data-point/commit/870b36f)), closes [#80](https://github.com/ViacomInc/data-point/issues/80)
* **data-point:** Refactor and expose reducer helper functions to API ([3d51509](https://github.com/ViacomInc/data-point/commit/3d51509)), closes [#123](https://github.com/ViacomInc/data-point/issues/123) [#40](https://github.com/ViacomInc/data-point/issues/40)
* **data-point/core:** Support both addEntityType and addEntityTypes ([#140](https://github.com/ViacomInc/data-point/issues/140)) ([d3ae5ec](https://github.com/ViacomInc/data-point/commit/d3ae5ec)), closes [#56](https://github.com/ViacomInc/data-point/issues/56)
* **data-point/entities:** adds conditional reducer operator ([#100](https://github.com/ViacomInc/data-point/issues/100)) ([9177b7c](https://github.com/ViacomInc/data-point/commit/9177b7c)), closes [#46](https://github.com/ViacomInc/data-point/issues/46)
* **data-point/entities:** creates Model entity ([#158](https://github.com/ViacomInc/data-point/issues/158)) ([6c96138](https://github.com/ViacomInc/data-point/commit/6c96138)), closes [#144](https://github.com/ViacomInc/data-point/issues/144)
* **data-point/entities,reducers:** normalize asCollection behaviour ([#103](https://github.com/ViacomInc/data-point/issues/103)) ([eb2c08c](https://github.com/ViacomInc/data-point/commit/eb2c08c)), closes [#60](https://github.com/ViacomInc/data-point/issues/60)
* **data-point/entity-schema:** Throw errors for invalid schemas ([#151](https://github.com/ViacomInc/data-point/issues/151)) ([56d5a0d](https://github.com/ViacomInc/data-point/commit/56d5a0d)), closes [#75](https://github.com/ViacomInc/data-point/issues/75)
* **data-point/reducer-path:** Deprecate the $. syntax for path reducers ([#138](https://github.com/ViacomInc/data-point/issues/138)) ([89943e9](https://github.com/ViacomInc/data-point/commit/89943e9)), closes [#52](https://github.com/ViacomInc/data-point/issues/52)
* **data-point/reducer-types:** Normalize reducer factory function signatures ([#127](https://github.com/ViacomInc/data-point/issues/127)) ([7d4f6f9](https://github.com/ViacomInc/data-point/commit/7d4f6f9))
* **data-point/request-entity:** improves request error message ([#111](https://github.com/ViacomInc/data-point/issues/111)) ([825f9a3](https://github.com/ViacomInc/data-point/commit/825f9a3)), closes [#110](https://github.com/ViacomInc/data-point/issues/110)


### BREAKING CHANGES

* **data-point:** only exposing a certain set of methods, if you depended on any method not listed here please create an Issue and we will do our best to address it.
* **data-point/core:** the signature for addEntityTypes has been changed
* **data-point/reducer-path:** $. is no longer supported as a special kind of path
* previously entities resolver would be skipped if value was invalid, you will now
have to make sure you are passing the right value to your entity or handle the error manually
* helpers.createResolveTransform is now called createReducerResolver, and the
function it returns no longer requires a resolveTransform parameter; helpers.createReducer no longer
requires a createTransform parameter

* docs(README): Add ReducerList to index of reducers in readme

* feat(helpers): Rename helpers.isTransform to helpers.isReducer
* isTransform was a function in the public API, and it is now replaced with isReducer
* **data-point/entities,reducers:** mapping an entity against a non `Array` will now return `undefined` (before it
would resolve as a single item), mapping with a reducer-path used to return `null`, it will now
return `undefined` if value is not an `Array`.



<a name="1.7.0"></a>
# 1.7.0 (2017-12-30)


### Bug Fixes

* **data-point/entities:** normalize transform entity ([#67](https://github.com/ViacomInc/data-point/issues/67)) ([e3ef7b7](https://github.com/ViacomInc/data-point/commit/e3ef7b7)), closes [#51](https://github.com/ViacomInc/data-point/issues/51)
* **entity-collection:** Fix execution order of collection entity modifiers ([#55](https://github.com/ViacomInc/data-point/issues/55)) ([a182f7b](https://github.com/ViacomInc/data-point/commit/a182f7b)), closes [#54](https://github.com/ViacomInc/data-point/issues/54)
* **lib/core/transform:** Do not pass original acc.value into _.defaults ([#44](https://github.com/ViacomInc/data-point/issues/44)) ([9d4415e](https://github.com/ViacomInc/data-point/commit/9d4415e)), closes [#43](https://github.com/ViacomInc/data-point/issues/43)
* **lib/reducer-entity:** improve regex for detecting entity ids ([6bcaa28](https://github.com/ViacomInc/data-point/commit/6bcaa28))


### Features

* **parsing:** improves errors parse messages ([9d6fdbe](https://github.com/ViacomInc/data-point/commit/9d6fdbe)), closes [#32](https://github.com/ViacomInc/data-point/issues/32)
* Remove support for filters ([d678fd3](https://github.com/ViacomInc/data-point/commit/d678fd3))



<a name="1.5.0"></a>
# 1.5.0 (2017-12-01)




<a name="3.2.0"></a>
# [3.2.0](https://github.com/ViacomInc/data-point/compare/v3.1.0...v3.2.0) (2018-05-02)


### Bug Fixes

* **data-point:** Allow find reducers to return falsy values ([#257](https://github.com/ViacomInc/data-point/issues/257)) ([4fe693b](https://github.com/ViacomInc/data-point/commit/4fe693b)), closes [#256](https://github.com/ViacomInc/data-point/issues/256)


### Features

* **data-point:** Add createTypeCheckReducer to public API ([#251](https://github.com/ViacomInc/data-point/issues/251)) ([cd10bf6](https://github.com/ViacomInc/data-point/commit/cd10bf6)), closes [#247](https://github.com/ViacomInc/data-point/issues/247)
* **data-point:** Replace _.partial with Array.bind ([#260](https://github.com/ViacomInc/data-point/issues/260)) ([5d4675e](https://github.com/ViacomInc/data-point/commit/5d4675e))
* **data-point:** Replace the Locals class with a plain object ([#254](https://github.com/ViacomInc/data-point/issues/254)) ([a379930](https://github.com/ViacomInc/data-point/commit/a379930))
* **data-point-service:** adds staleWhileRevalidate feature ([#267](https://github.com/ViacomInc/data-point/issues/267)) ([a121249](https://github.com/ViacomInc/data-point/commit/a121249)), closes [#265](https://github.com/ViacomInc/data-point/issues/265)




<a name="3.1.0"></a>
# [3.1.0](https://github.com/ViacomInc/data-point/compare/v3.0.0...v3.1.0) (2018-03-07)


### Features

* **data-point:** Add entity factories ([#238](https://github.com/ViacomInc/data-point/issues/238)) ([c9acf7d](https://github.com/ViacomInc/data-point/commit/c9acf7d))
* **data-point:** Expose createReducer on DataPoint object ([#234](https://github.com/ViacomInc/data-point/issues/234)) ([41eb42a](https://github.com/ViacomInc/data-point/commit/41eb42a)), closes [#233](https://github.com/ViacomInc/data-point/issues/233)
* Address todo comments regarding object mutation ([#239](https://github.com/ViacomInc/data-point/issues/239)) ([a6b8318](https://github.com/ViacomInc/data-point/commit/a6b8318))




<a name="3.0.0"></a>
# [3.0.0](https://github.com/ViacomInc/data-point/compare/v2.0.0...v3.0.0) (2018-02-26)


### Bug Fixes

* **reducer-list:** ReducerList factory now throws an error for falsy input ([#212](https://github.com/ViacomInc/data-point/issues/212)) ([2c65794](https://github.com/ViacomInc/data-point/commit/2c65794)), closes [#188](https://github.com/ViacomInc/data-point/issues/188)


### Features

* **data-point:** Normalize collection and hash type checking functionality ([#214](https://github.com/ViacomInc/data-point/issues/214)) ([d083cd1](https://github.com/ViacomInc/data-point/commit/d083cd1)), closes [#189](https://github.com/ViacomInc/data-point/issues/189)
* **data-point:** Refactor behavior of find, filter, and empty reducers ([#207](https://github.com/ViacomInc/data-point/issues/207)) ([1a80a47](https://github.com/ViacomInc/data-point/commit/1a80a47)), closes [#122](https://github.com/ViacomInc/data-point/issues/122) [#176](https://github.com/ViacomInc/data-point/issues/176)
* **data-point:** Remove predefined hash and collection execution order ([#218](https://github.com/ViacomInc/data-point/issues/218)) ([8fc75c1](https://github.com/ViacomInc/data-point/commit/8fc75c1)), closes [#73](https://github.com/ViacomInc/data-point/issues/73)
* **data-point-codemod:** adds codemod package ([#172](https://github.com/ViacomInc/data-point/issues/172)) ([8ac4f37](https://github.com/ViacomInc/data-point/commit/8ac4f37)), closes [#117](https://github.com/ViacomInc/data-point/issues/117)
* **data-point/entity-request:** Resolve EntityRequest#options with a reducer ([#163](https://github.com/ViacomInc/data-point/issues/163)) ([02efbf9](https://github.com/ViacomInc/data-point/commit/02efbf9))
* **data-point/helpers:** Do not export type checking functions ([#220](https://github.com/ViacomInc/data-point/issues/220)) ([6e54252](https://github.com/ViacomInc/data-point/commit/6e54252)), closes [#215](https://github.com/ViacomInc/data-point/issues/215)
* **data-point/reducer-parallel:** Add ReducerParallel type ([#191](https://github.com/ViacomInc/data-point/issues/191)) ([485f4ab](https://github.com/ViacomInc/data-point/commit/485f4ab)), closes [#168](https://github.com/ViacomInc/data-point/issues/168)
* **data-point/reducer-path:** Add a custom name to ReducerPath#body functions ([#193](https://github.com/ViacomInc/data-point/issues/193)) ([6aab266](https://github.com/ViacomInc/data-point/commit/6aab266)), closes [#182](https://github.com/ViacomInc/data-point/issues/182)
* **data-point/reducer-types:** Add the ReducerConstant type ([#173](https://github.com/ViacomInc/data-point/issues/173)) ([7a95d38](https://github.com/ViacomInc/data-point/commit/7a95d38))


### BREAKING CHANGES

* **reducer-list:** Anything relying on putting a falsy, non-string value into ReducerList will now
throw an error
* **data-point:** No longer possible to use multiple modifiers without a compose array
* **data-point:** ReducerPick with no keys resolves to an empty object; empty ReducerLists resolve to undefined; empty ReducerObjects resolve to empty objects
* **data-point-codemod:** every reducer function needs to be changed to accept the first parameter as the
reducer's input, use codemods provided
* **data-point/entity-request:** EntityRequest#options must be defined as a reducer instead of a TransformObject

* feat(data-point/entity-request): Remove support for EntityRequest#beforeRequest

this is no longer necessary because options is now a reducer
* **data-point/entity-request:** removes EntityRequest#beforeRequest from the API




<a name="1.7.0"></a>
# [1.7.0](https://github.com/ViacomInc/data-point/compare/v1.5.0...v1.7.0) (2017-12-30)


### Bug Fixes

* **data-point/entities:** normalize transform entity ([#67](https://github.com/ViacomInc/data-point/issues/67)) ([e3ef7b7](https://github.com/ViacomInc/data-point/commit/e3ef7b7)), closes [#51](https://github.com/ViacomInc/data-point/issues/51)
* **entity-collection:** Fix execution order of collection entity modifiers ([#55](https://github.com/ViacomInc/data-point/issues/55)) ([a182f7b](https://github.com/ViacomInc/data-point/commit/a182f7b)), closes [#54](https://github.com/ViacomInc/data-point/issues/54)
* **lib/core/transform:** Do not pass original acc.value into _.defaults ([#44](https://github.com/ViacomInc/data-point/issues/44)) ([9d4415e](https://github.com/ViacomInc/data-point/commit/9d4415e)), closes [#43](https://github.com/ViacomInc/data-point/issues/43)
* **lib/reducer-entity:** improve regex for detecting entity ids ([6bcaa28](https://github.com/ViacomInc/data-point/commit/6bcaa28))


### Features

* **parsing:** improves errors parse messages ([9d6fdbe](https://github.com/ViacomInc/data-point/commit/9d6fdbe)), closes [#32](https://github.com/ViacomInc/data-point/issues/32)
* Remove support for filters ([d678fd3](https://github.com/ViacomInc/data-point/commit/d678fd3))




<a name="1.6.3"></a>
## [1.6.3](https://github.com/ViacomInc/data-point/compare/v1.6.2...v1.6.3) (2017-12-30)




**Note:** Version bump only for package data-point

<a name="1.6.2"></a>
## [1.6.2](https://github.com/ViacomInc/data-point/compare/v1.6.1...v1.6.2) (2017-12-30)




**Note:** Version bump only for package data-point

<a name="1.6.1"></a>
## [1.6.1](https://github.com/ViacomInc/data-point/compare/v1.6.0...v1.6.1) (2017-12-30)




**Note:** Version bump only for package data-point

<a name="1.6.0"></a>
# [1.6.0](https://github.com/ViacomInc/data-point/compare/v1.5.0...v1.6.0) (2017-12-30)


### Bug Fixes

* **data-point/entities:** normalize transform entity ([#67](https://github.com/ViacomInc/data-point/issues/67)) ([e3ef7b7](https://github.com/ViacomInc/data-point/commit/e3ef7b7)), closes [#51](https://github.com/ViacomInc/data-point/issues/51)
* **entity-collection:** Fix execution order of collection entity modifiers ([#55](https://github.com/ViacomInc/data-point/issues/55)) ([a182f7b](https://github.com/ViacomInc/data-point/commit/a182f7b)), closes [#54](https://github.com/ViacomInc/data-point/issues/54)
* **lib/core/transform:** Do not pass original acc.value into _.defaults ([#44](https://github.com/ViacomInc/data-point/issues/44)) ([9d4415e](https://github.com/ViacomInc/data-point/commit/9d4415e)), closes [#43](https://github.com/ViacomInc/data-point/issues/43)
* **lib/reducer-entity:** improve regex for detecting entity ids ([6bcaa28](https://github.com/ViacomInc/data-point/commit/6bcaa28))


### Features

* **parsing:** improves errors parse messages ([9d6fdbe](https://github.com/ViacomInc/data-point/commit/9d6fdbe)), closes [#32](https://github.com/ViacomInc/data-point/issues/32)
* Remove support for filters ([d678fd3](https://github.com/ViacomInc/data-point/commit/d678fd3))




<a name="1.5.0"></a>
# [1.5.0](https://github.com/ViacomInc/data-point/compare/v1.3.0...v1.5.0) (2017-12-01)




**Note:** Version bump only for package data-point
