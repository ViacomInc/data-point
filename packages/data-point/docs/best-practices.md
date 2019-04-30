# DataPoint best practices

All documentation here is meant to serve as advice and comes from our learnings on using the library ourselves. If you have new/improved/different ways to approach similar problems we encourage you to share it with us.

## Entities

### Creation

There are two ways to create an entity in DataPoint:

- [Registered entities](https://github.com/ViacomInc/data-point/tree/master/packages/data-point#registered-entity)
- [Instance entities](https://github.com/ViacomInc/data-point/tree/master/packages/data-point#instance-entity)

Each one is meant to be used for different use cases and because of this each one provides advantages over the other depending the situation.

#### Registered Entity

It is meant to be [registered](https://github.com/ViacomInc/data-point/tree/master/packages/data-point#registered-entity) into DataPoint instance and available globally at any given point via a reducer in string form see: [Entity By Id Reducer](https://github.com/ViacomInc/data-point/tree/master/packages/data-point#entity-by-id-reducer).

**Example:**

```js
const DataPoint = require('data-point')
const entities = {
  'model:Card': {
    value: {
      id: '$uid',
      title: '$shortTitle',
      date: localizeDate('lastModified')
    }
  }
}
const dp = DataPoint.create({
  entities, // registering entities
})

// call entity by registered reference
dp.resolve('model:Card', input)
  .then(result => {
    console.dir(result)
  })
```

#### Instance Entity

It is designed to be used as a stand-alone reducer that can be declared on a module and exported to be used elsewhere. Because it is the result of an entity factory it produces a variable which can easily be looked up using lookup functionality on most modern IDEs. (e.g. [vscode go-to-definition](https://code.visualstudio.com/docs/editor/editingevolved#_go-to-definition)).

**Example:**

```js
const DataPoint = require('data-point')

// card is a variable you can export from a module
const Card = DataPoint.Model('Card', {
  value: {
    id: '$uid',
    title: '$shortTitle',
    date: localizeDate('lastModified')
  }
})

const dp = DataPoint.create()

// we call the entity directly
dp.resolve(Card, input)
  .then(result => {
    console.dir(result)
  })
```

### Performance

Both entities internally are exactly the same, the main difference is how DataPoint access them when they are executed. Registered entities need to be looked up, which usually takes nanoseconds depending on how many entities are registered and could be considered the only real disadvantage compared to an entity instance.

#### Feature comparison

| Usage | Registered | Instance |
|:--|:--:|:--:|
| Testable | ✔️ | ✔️ |
| Globally available | ✔️ | ✖️ |
| Suited to be exported as part of a module | ✖️ | ✔️ |
| Discoverability | ✖️ | ✔️ |
| Compilation check | ✖️ | ✔️ |
| Runtime check | ✔️ | ✔️ |

## Testing

Testing DataPoint transformations should not be any different from any other 

### Reducer Paths

[Reducer paths](https://github.com/ViacomInc/data-point/tree/master/packages/data-point#path-reducer) are the most basic reducer and probably they not worth testing individually, if what you want is to test data integrity you should probably either use the Entity's [type checking](https://github.com/ViacomInc/data-point/tree/master/packages/data-point#entity-type-check) hooks or/and use the [Schema Entity](https://github.com/ViacomInc/data-point/tree/master/packages/data-point#schema-entity) for a full JSONSchema validation.

### Function Reducer

[Function Reducer](https://github.com/ViacomInc/data-point/tree/master/packages/data-point#function-reducer) should be tested as any other Javascript function. A function reducer receives an accumulator object as its second parameter which at times you might need to [mock](#mocking-accumulator-object) to be able to test your reducer. On most cases testing a function reducer does not need an instance of DataPoint to test its functionality.

### Object Reducer

To test an [Object Reducer](https://github.com/ViacomInc/data-point/tree/master/packages/data-point#object-reducer). 

💡 Requires a DataPoint instance to test

Example ([examples/object-reducer.test.js](examples/object-reducer.test.js)):

```js
const DataPoint = require('data-point')

function getMonth(rawDate) {
  const date = new Date(rawDate)
  return date.getMonth() + 1
}

const Card = {
  id: '$uid',
  title: '$shortTitle',
  monthCreated: ['$dateCreated', getMonth]
}

// getMonth unit tests are omitted for the purpose of the example

describe('Card Object Reducer', () => {
  it('should create Card Object', async () => {
    const dataPoint = DataPoint.create()

    const input = {
      uid: 123,
      shortTitle: 'Some Title',
      dateCreated: '2018-12-04T03:24:00'
    }

    const result = await dataPoint.resolve(Card, input)

    expect(result).toEqual({
      id: 123,
      title: 'Some Title',
      monthCreated: 12
    })
  })
})
```

### Instance entity

Example ([examples/entity.test.js](examples/entity.test.js)):

💡 Requires a DataPoint instance to test

```js
/* eslint-env jest */

const DataPoint = require('data-point')

const checkCardInputSchema = DataPoint.createTypeCheckReducer(
  (input) => {
    return typeof input.uid === 'number' && typeof input.shortTitle === 'string'
  },
  '{uid:Number, shortTitle:String}'
)

const CardModel = DataPoint.Model('Card', {
  inputType: checkCardInputSchema,
  value: {
    id: '$uid',
    title: '$shortTitle'
  }
})

describe('Card Entity', () => {
  it('should create Card Object', async () => {
    const dataPoint = DataPoint.create()
    const input = {
      uid: 123,
      shortTitle: 'Some Title'
    }

    await expect(dataPoint.resolve(CardModel, input))
      .resolves.toEqual({
        id: 123,
        title: 'Some Title'
      })
  })

  it('should check for input type', async () => {
    const dataPoint = DataPoint.create()

    const input = {
      shortTitle: 'Some Title'
    }

    await expect(dataPoint.resolve(CardModel, input))
      .rejects.toMatchSnapshot()
  })
})
```

### List Reducer

A [List Reducer](https://github.com/ViacomInc/data-point/tree/master/packages/data-point#list-reducer) is nothing more than an array with other reducers inside. You can test them in the same way you would test a single reducer by passing the List Reducer to the `dataPoint.resolve()` method and testing against the result.

### Mocking

To keep your tests more focused it could be a good idea to isolate the behavior of the transformation you want to test and replace any external dependencies through a mocking mechanism.

#### Mocking Accumulator Object

**Example:**

Using `Accumulator.create` factory for mocking the **Accumulator** object:

```js
const Accumulator = require('data-point/lib/accumulator')

function getLocalizedMonth(valuePath) {
  return (input, acc) => {
    const rawDate = get(input, valuePath)
    const date = new Date(rawDate)
    return acc.locals.i18n.months[date.getMonth()]
  }
}

describe('getLocalizedMonth', () => {
  it('should return localized month name', () => {
    const acc = Accumulator.create()
    const i18n = {
      months: ['Enero', 'Febrero', /* rest of months... */ ]
    }
    acc.locals.i18n = i18n

    expect(getLocalizedMonth(new Date('2018-02-04T03:24:00'))).toEqual('Febrero')
  })
})
```

#### Mocking a Request

Internally on DataPoint, we are using [nock](https://www.npmjs.com/package/nock) to mock Request entities.

Example ([examples/request-entity-mock.test.js](request-entity-mock.test.js)):

```js
const DataPoint = require('data-point')
const nock = require('nock')

const PersonByIdRequest = DataPoint.Request('PersonByIdRequest', {
  url: 'https://swapi.co/api/people/{value}/'
})

describe('PersonByIdRequest', () => {
  it('should request Swapi API to fetch a person by its id', async () => {
    const dataPoint = DataPoint.create()

    const response = {
      name: 'Obi-Wan Kenobi'
    }

    nock('https://swapi.co')
      .get('/api/people/10/')
      .reply(200, response)

    const result = await dataPoint.resolve(PersonByIdRequest, 10)

    expect(result).toEqual(response)
  })
})
```

## Asynchronous execution

By design DataPoint transformations are asynchronous, this provides maximum flexibility for writing your code but it also means that there are some things we must take into account and some patterns to be avoided to provide the best performance

Patterns related to this topic:

- grouping multiple synchronous reducers together
- picking/omitting keys from an object
- using functions to manipulate objects
- optimizing operations on collections

## Patterns

### Pure Functions

We should think of DataPoint only as a transformation tool, your transformations should(when possible) follow the same principles of [pure functions](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-a-pure-function-d1c076bec976):

- Given the same inputs, always returns the same output.
- [Referential transparency](https://medium.com/@olxc/referential-transparency-93352c2dd713) - if the expression can be replaced with its value without changing the program’s behavior.
- **Produce no side effects** - the expression should not alter any external state (this includes not mutating any of the parameter values).

⚠️ It should be stressed that you should not modify the accumulator object (because it's very tempting to modify it directly). Since everything is async, modifying the accumulator could have unpredictable results if multiple reducers have a reference to the same object.

### Higher Order Reducers

There are multiple types of reducers, you can use them directly on a transformation, or you can use the pattern of [higher order functions](https://medium.com/javascript-scene/higher-order-functions-composing-software-5365cf2cbe99) to create dynamic/parameterized reducers.

- Dynamically create a reducer
- Parameterize the creation of a reducer
- Create multiple reducers with similar or default configurations

#### Function reducer

```js
function getLocale(localeId) {
  return (input, acc) => {
    // assume acc.locals.localization holds a Map of all available locales
    return acc.locals.localization.get(localeId)
  }
}
```

#### Entity Reducer

```js
const SwapiAPI = (service) => {
  // generates a Request Entity with name `SwapiAPI-${service}`
  return Request(`SwapiAPI-${service}`, {
    // inject the resolved value to the end of the URL
    url: `https://swapi.co/api/${service}/{value}`,
    params: {
      cache: {
        ttl: '20m'
        staleWhileRevalidate: '1h'
      }
    }
  })
}

// for hitting: https://swapi.co/api/people/{value}
const PeopleRequest = SwapiAPI('people')

// for hitting: https://swapi.co/api/planets/{value}
const PlanetsRequest = SwapiAPI('planets')

dataPoint.resolve(PeopleRequest, 10).then((result) => {
  // result would be the value of:
  // https://swapi.co/api/people/10
}))
```

### Picking/omitting keys from an object

Using utilities like lodash's [_.pick](https://lodash.com/docs/4.17.11#pick) and [_.omit](https://lodash.com/docs/4.17.11#omit) can help you around this, especially if you do not intend to change any of the key's name.

️️⚠️ It can be tempting to use the Object reducer **only** to pick properties from an input source, this is not be the best usage of this reducer, mainly because the resolution of each key is executed asynchronously.


💡 Lodash by default does not support currying or value at the end, for this you may want to look into [lodash/fp](https://github.com/lodash/lodash/wiki/FP-Guide) or [ramda](https://ramdajs.com/docs/#pick)

💡 Lodash pick/omit support deep nesting of properties (unfortunately ramda does not) such as the example below:

```js
pick({a: 1, b: {c: 2, d: 3}}, ['a', 'b.d']) -> {a: 1, b: {d: 3}}
```

**Examples:**

NOTE: assume `PeopleRequest` makes a request to an external API to get a Person Object.

Instead of this:

```js
const Person = {
  name: '$name',
  height: '$height',
  mass: '$mass'
}

dataPoint.resolve([PeopleRequest, Person], 10)
  .then((result) => {
  
  })
```

Using lodash's [_.pick](https://lodash.com/docs/4.17.11#pick):

```js
const pick = require('lodash/pick')

// you must wrap pick in a function so you can use it as a reducer
const pickPersonFields = (value) => pick(value, [
  'name',
  'height',
  'mass'
])

dataPoint.resolve([PeopleRequest, pickPersonFields], 10)
  .then((result) => {
  
  })
```

Using lodash's fp/pick: ([FP-Guide](https://github.com/lodash/lodash/wiki/FP-Guide))

```js
// fp/pick has the signature of ([paths]. object) and accepts curring
const pick = require('lodash/fp/pick')

const pickPersonFields = pick([
  'name',
  'height',
  'mass'
])

dataPoint.resolve([PeopleRequest, pickPersonFields], 10)
  .then((result) => {
  
  })
```

Using Ramda [pick](https://ramdajs.com/docs/#pick)

```js
// ramda natively supports curring and supplied value is last parameter
const R = require('ramda')

const pickPersonFields = R.pick([
  'name',
  'height',
  'mass'
])

dataPoint.resolve([PeopleRequest, pickPersonFields], 10)
  .then((result) => {
  
  })
```

### Grouping multiple synchronous reducers together

If you want to execute multiple synchronous operations, it is a performance improvement to chain them by using the compose pattern. You can find implementations of this pattern on Lodash [_.flow](https://lodash.com/docs/4.17.11#flow) or Ramda's [R.compose](https://ramdajs.com/docs/#compose).

Instead of:

```js
const reducers = [
  (input) => input.split(' '),
  (input) => input.map(word=> word[0].toUpperCase() + word[0].substring(1))
  (input) => input.join(''))
]

dataPoint.resolve(reducers, 'how do you do')
  .then((result) => {
    console.assert(result, 'HowDoYouDo')
  })
```

Using compose:

```js
// this creates a function that will be treated as a single reducer
const wordsToCamelCase = _.flow([
  (input) => input.split(' '),
  (input) => input.map(word=> word[0].toUpperCase() + word[0].substring(1))
  (input) => input.join(''))
])

dataPoint.resolve(wordsToCamelCase, 'how do you do')
  .then((result) => {
    console.assert(result, 'HowDoYouDo')
  })
```
