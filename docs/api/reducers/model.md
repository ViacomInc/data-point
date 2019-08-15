---
id: model
title: Model
sidebar_label: Model
---

```js
const { Model } = require("data-point");
```

Extends the [EntityReducer](entity-reducer) Class.

## Syntax

```js
Model({
  name: String,
  inputType: String | Reducer,
  before: Reducer,
  value: Reducer,
  after: Reducer,
  outputType: String | Reducer,
  catch: Reducer,
  params: Object
});
```

## Properties exposed

| Key                            | Type                                  | Description                                                                                                          |
| :----------------------------- | :------------------------------------ | :------------------------------------------------------------------------------------------------------------------- |
| _name_                         | `String`                              | constant name identifier for the given entity.                                                                       |
| [inputType](#modelinputtype)   | `String`, [Reducer](../reducer-types) | [type checks](#entity-type-check) the entity's input value, **does not mutate it**.                                  |
| [before](#modelbefore)         | [Reducer](../reducer-types)           | reducer to be resolved **before** the entity resolution.                                                             |
| [value](#modelvalue)           | [Reducer](../reducer-types)           | The value to which the Entity resolves.                                                                              |
| [after](#modelafter)           | [Reducer](../reducer-types)           | reducer to be resolved **after** the entity resolution.                                                              |
| [outputType](#modeloutputtype) | `String`, [Reducer](../reducer-types) | [type checks](#entity-type-check) the entity's output value, **does not mutate it**.                                 |
| [catch](#modelcatch)           | [Reducer](../reducer-types)           | reducer to be resolved in case of an error (including errors thrown from the `inputType` and `outputType` reducers). |
| [params](#modelparams)         | `Object`                              | user defined Object that will be passed to every transform within the context of the transform's execution.          |

## model.inputType

Executes before any other reducer in the life-cycle chain. If it fails to pass it can be handled with [model.catch](#modelcatch). See [type checking](#entity-type-check) for more details.

### Example: Check input

Checks if a model receives as input an object.

```js
const Name = Model({
  inputType: "object",
  value: "$name"
});

const input = {
  name: "Laia"
};

const output = await dataPoint.resolve(input, Name);

assert.strictEqual(output, "Laia");
```

## model.outputType

Executes after [model.after](#modelafter). See [type checking](#entity-type-check) for more details.

### Example: Check output

Check if a model outputs a string.

```js
const Name = Model({
  value: "$name",
  outputType: "string"
});

const input = {
  name: "Darek"
};

const output = await dataPoint.resolve(input, Name);

assert.strictEqual(output, "Darek");
```

## model.value

Use this property to do your main processing for the entity.

### Example: model.value

Say Hello World.

```js
const MyModel = Model({
  value: input => `Hello ${input}!!`
});

const output = await dataPoint.resolve("World", MyModel);
assert.strictEqual(output, "Hello World!!");
```

## model.before

Executes right after executing inputType reducer. You may use it to normalize the value.

### Example: model.before

Convert array to string and add exclamation marks.

```js
const arrayToString = input => {
  return input.join(" ");
};

const MyList = Model({
  before: arrayToString,
  value: input => `${input}!!`
});

const output = await dataPoint.resolve(["Hello", "World"], MyList);
assert.deepStrictEqual(output, "Hello World!!");
```

## model.after

Executes right after executing inputType reducer. You may use it to normalize the value.

### Example: model.after

Convert array to string and add exclamation marks.

```js
const { DataPoint, Model } = require("data-point");

const stringToArray = input => {
  return input.split();
};

const MyList = Model({
  value: input => `${input}!!`,
  before: stringToArray
});

const output = await dataPoint.resolve("Hello World!!", MyList);
assert.deepStrictEqual(output, ["Hello", "World!!"]);
```

## model.catch

Any error that happens within the resolution of the Entity can be handled by the `catch` reducer. To respect the API, error reducers have the same API.

You may stop the propagation of the error by not re-throwing the error.

### Example: Handling Entry Errors

Let's resolve to a non-array value and see how it would be handled, this example will use [outputType](#entity-type-check) for type checking.

```js
const myModel = Model({
  // points to a NON Array value
  value: "$a.b",
  outputType: "isArray",
  catch: error => {
    // prints out the error
    // message generated by
    // isArray type check
    console.log(error.message);

    console.log("Output value is invalid, resolving to empty array");

    // passing a value will stop
    // the propagation of the error
    return [];
  }
});

const input = {
  a: {
    b: "foo"
  }
};

const output = await dataPoint.resolve(input, myModel);

assert.deepStrictEqual(output, []);
```

### Example: re-throwing error

Re-throw the error to be handled somewhere else.

```js
const MyModel = Model({
  value: "$a",
  outputType: "isArray",
  catch: error => {
    console.log("MyModel has errors:", error);
    throw error;
  }
});

const input = {
  a: {
    b: "foo"
  }
};

dataPoint.resolve(input, MyModel).catch(error => {
  assert.strictEqual(error.name, "TypeError");
});
```

## model.params

The `params` object is used to pass custom data to the entity. This Object can be accessed under the `reducer` property of the [Accumulator](../accumulator) Object (`acc.reducer.params`).

### Example: access the param object

Use a FunctionReducer to access the param object.

```js
const multiplyValue = (input, acc) => {
  return input * acc.reducer.params.multiplier;
};

const MyModel = Model({
  value: multiplyValue,
  params: {
    multiplier: 100
  }
});

const output = await dataPoint.resolve(200, MyModel);
assert.strictEqual(output, 20000);
```

## Entity type check

You can use **inputType** and **outputType** for type checking an entity's input and output values. Type checking does not mutate the result.

### Built in type checks

To use built-in type checks, you may set the value of **inputType** or **outputType** to: `'string'`, `'number'`, `'boolean'`, `'function'`, `'error'`, `'array'`, or `'object'`.

### Custom type checking

You may also type check by creating a [Reducer](../reducer-types) with the `createTypeCheckReducer` function.

#### Factory syntax

```js
const { createTypeCheckReducer } = require("data-point");
```

```js
createTypeCheckReducer(expectedType, typeCheckFunction);
```

#### Factory arguments

| Argument            | Type                          | Description                                                                                                                                                |
| :------------------ | :---------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| _typeCheckFunction_ | `Function<Boolean or String>` | Return `true` when the input is valid; otherwise, an error will be thrown. If the function returns a `string`, that will be appended to the error message. |
| _expectedType_      | `string` _(optional)_         | The expected type; this will also be used in the error message.                                                                                            |

#### Example: custom type-check

Custom type check with a [FunctionReducer](function-reducer).

```js
const isNonEmptyArray = input => Array.isArray(input) && input.length > 0;

const MyList = Model({
  inputType: createTypeCheckReducer("non-empty-array", isNonEmptyArray),
  value: input => input[0]
});

await dataPoint.resolve(MyList, ["a", "b"]);
```
