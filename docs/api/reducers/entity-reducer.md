---
id: entity-reducer
title: EntityReducer Class
sidebar_label: EntityReducer Class
---

Every entity extends the _EntityReducer_ Class that provides an API of **property** and **life-cycle methods** that allow you to have more control over your transformations.

## Syntax

```js
ReducerEntity {
  name: String,
  inputType: String | Reducer,
  before: Reducer,
  after: Reducer,
  outputType: String | Reducer,
  catch: Reducer,
  params: Object
}
```

## Properties exposed

| Key          | Type                                  | Description                                                                                                          |
| :----------- | :------------------------------------ | :------------------------------------------------------------------------------------------------------------------- |
| _name_       | `String`                              | constant name identifier for the given entity.                                                                       |
| _inputType_  | `String`, [Reducer](../reducer-types) | [type checks](#entity-type-check) the entity's input value, **does not mutate it**.                                  |
| _before_     | [Reducer](../reducer-types)           | reducer to be resolved **before** the entity resolution.                                                             |
| _after_      | [Reducer](../reducer-types)           | reducer to be resolved **after** the entity resolution.                                                              |
| _outputType_ | `String`, [Reducer](../reducer-types) | [type checks](#entity-type-check) the entity's output value, **does not mutate it**.                                 |
| _catch_      | [Reducer](../reducer-types)           | reducer to be resolved in case of an error (including errors thrown from the `inputType` and `outputType` reducers). |
| _params_     | `Object`                              | user defined Object that will be passed to every transform within the context of the transform's execution.          |

For more information and examples on how to use this API see the [Model](model) entity.
