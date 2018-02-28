# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="3.0.0"></a>
# [3.0.0](https://github.com/ViacomInc/data-point/compare/v2.0.0...v3.0.0) (2018-02-26)


### Bug Fixes

* **reducer-list:** ReducerList factory now throws an error for falsy input ([#212](https://github.com/ViacomInc/data-point/issues/212)) ([2c65794](https://github.com/ViacomInc/data-point/commit/2c65794)), closes [#188](https://github.com/ViacomInc/data-point/issues/188)
* **scripts/preinstall-script.js:** Removes yarn vs npm warning  ([#197](https://github.com/ViacomInc/data-point/issues/197)) ([0ab9711](https://github.com/ViacomInc/data-point/commit/0ab9711))


### Features

* **bench-trial:** new package to benchmark performance ([#192](https://github.com/ViacomInc/data-point/issues/192)) ([a704568](https://github.com/ViacomInc/data-point/commit/a704568))
* **data-point:** Normalize collection and hash type checking functionality ([#214](https://github.com/ViacomInc/data-point/issues/214)) ([d083cd1](https://github.com/ViacomInc/data-point/commit/d083cd1)), closes [#189](https://github.com/ViacomInc/data-point/issues/189)
* **data-point:** Refactor behavior of find, filter, and empty reducers ([#207](https://github.com/ViacomInc/data-point/issues/207)) ([1a80a47](https://github.com/ViacomInc/data-point/commit/1a80a47)), closes [#122](https://github.com/ViacomInc/data-point/issues/122) [#176](https://github.com/ViacomInc/data-point/issues/176)
* **data-point:** Remove predefined hash and collection execution order ([#218](https://github.com/ViacomInc/data-point/issues/218)) ([8fc75c1](https://github.com/ViacomInc/data-point/commit/8fc75c1)), closes [#73](https://github.com/ViacomInc/data-point/issues/73)
* **data-point-codemod:** adds codemod package ([#172](https://github.com/ViacomInc/data-point/issues/172)) ([8ac4f37](https://github.com/ViacomInc/data-point/commit/8ac4f37)), closes [#117](https://github.com/ViacomInc/data-point/issues/117)
* **data-point-codemods:** Add codemod for changing PathReducer from $. to $ ([#183](https://github.com/ViacomInc/data-point/issues/183)) ([bb6c7bc](https://github.com/ViacomInc/data-point/commit/bb6c7bc)), closes [#179](https://github.com/ViacomInc/data-point/issues/179)
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

* Remove support for filters ([d678fd3](https://github.com/ViacomInc/data-point/commit/d678fd3))
* **all-contributors:** add all-contributors list ([#70](https://github.com/ViacomInc/data-point/issues/70)) ([fd9b9b5](https://github.com/ViacomInc/data-point/commit/fd9b9b5)), closes [#66](https://github.com/ViacomInc/data-point/issues/66)
* **parsing:** improves errors parse messages ([9d6fdbe](https://github.com/ViacomInc/data-point/commit/9d6fdbe)), closes [#32](https://github.com/ViacomInc/data-point/issues/32)




<a name="1.6.3"></a>
## [1.6.3](https://github.com/acatl/data-point/compare/v1.6.2...v1.6.3) (2017-12-30)




**Note:** Version bump only for package root

<a name="1.6.2"></a>
## [1.6.2](https://github.com/acatl/data-point/compare/v1.6.1...v1.6.2) (2017-12-30)




**Note:** Version bump only for package root

<a name="1.6.1"></a>
## [1.6.1](https://github.com/acatl/data-point/compare/v1.6.0...v1.6.1) (2017-12-30)




**Note:** Version bump only for package root

<a name="1.6.0"></a>
# [1.6.0](https://github.com/acatl/data-point/compare/v1.5.0...v1.6.0) (2017-12-30)


### Bug Fixes

* **data-point/entities:** normalize transform entity ([#67](https://github.com/acatl/data-point/issues/67)) ([e3ef7b7](https://github.com/acatl/data-point/commit/e3ef7b7)), closes [#51](https://github.com/acatl/data-point/issues/51)
* **entity-collection:** Fix execution order of collection entity modifiers ([#55](https://github.com/acatl/data-point/issues/55)) ([a182f7b](https://github.com/acatl/data-point/commit/a182f7b)), closes [#54](https://github.com/acatl/data-point/issues/54)
* **lib/core/transform:** Do not pass original acc.value into _.defaults ([#44](https://github.com/acatl/data-point/issues/44)) ([9d4415e](https://github.com/acatl/data-point/commit/9d4415e)), closes [#43](https://github.com/acatl/data-point/issues/43)
* **lib/reducer-entity:** improve regex for detecting entity ids ([6bcaa28](https://github.com/acatl/data-point/commit/6bcaa28))


### Features

* Remove support for filters ([d678fd3](https://github.com/acatl/data-point/commit/d678fd3))
* **all-contributors:** add all-contributors list ([#70](https://github.com/acatl/data-point/issues/70)) ([fd9b9b5](https://github.com/acatl/data-point/commit/fd9b9b5)), closes [#66](https://github.com/acatl/data-point/issues/66)
* **parsing:** improves errors parse messages ([9d6fdbe](https://github.com/acatl/data-point/commit/9d6fdbe)), closes [#32](https://github.com/acatl/data-point/issues/32)




<a name="1.5.0"></a>
# [1.5.0](https://github.com/ViacomInc/data-point/compare/v1.3.0...v1.5.0) (2017-12-01)


### Bug Fixes

* **core/factory:** fix datapoint factory fails if no entities are passed ([2c571bb](https://github.com/ViacomInc/data-point/commit/2c571bb)), closes [#29](https://github.com/ViacomInc/data-point/issues/29)
* **request-entity:** request inspect options not showing ([b631452](https://github.com/ViacomInc/data-point/commit/b631452)), closes [#27](https://github.com/ViacomInc/data-point/issues/27)


### Features

* **packages:** adds cache, express and service pacakges ([f2ab6f5](https://github.com/ViacomInc/data-point/commit/f2ab6f5))




<a name="1.3.0"></a>
# [1.3.0](https://github.com/ViacomInc/data-point/compare/v1.2.0...v1.3.0) (2017-11-30)


### Bug Fixes

* **utils:** placed back 'use strict' ([3e30357](https://github.com/ViacomInc/data-point/commit/3e30357)), closes [#26](https://github.com/ViacomInc/data-point/issues/26)


### Features

* **entity-request:** ability to inspect a request before making the call ([0c80c07](https://github.com/ViacomInc/data-point/commit/0c80c07)), closes [#25](https://github.com/ViacomInc/data-point/issues/25)



<a name="1.2.0"></a>
# [1.2.0](https://github.com/ViacomInc/data-point/compare/v1.1.0...v1.2.0) (2017-11-25)


### Bug Fixes

* **entity-types/*:** remove es6 syntax ([4623b4a](https://github.com/ViacomInc/data-point/commit/4623b4a)), closes [#20](https://github.com/ViacomInc/data-point/issues/20) [#21](https://github.com/ViacomInc/data-point/issues/21)


### Features

* **entity-types/*:** attach entityId to error ([f85e6eb](https://github.com/ViacomInc/data-point/commit/f85e6eb)), closes [#20](https://github.com/ViacomInc/data-point/issues/20)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/ViacomInc/data-point/compare/v1.0.1...v1.1.0) (2017-10-24)



<a name="1.0.1"></a>
## [1.0.1](https://github.com/ViacomInc/data-point/compare/v1.0.0...v1.0.1) (2017-10-03)


### Bug Fixes

* **entity-hash:** fixes unclear error message ([9220d59](https://github.com/ViacomInc/data-point/commit/9220d59))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/ViacomInc/data-point/compare/v0.0.0...v1.0.0) (2017-09-27)



<a name="0.0.0"></a>
# 0.0.0 (2017-09-27)


### Features

* first OS commit!! ([76b916f](https://github.com/ViacomInc/data-point/commit/76b916f))
