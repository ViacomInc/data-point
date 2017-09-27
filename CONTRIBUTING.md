# Contributing

> Before contributing, please read our [code of conduct](CODE_OF_CONDUCT.md).

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the owners of this repository before making a change. 

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Setup

```bash
git clone git@github.com:Viacom/data-point.git
cd data-point
npm install
```

## Running Tests

Once you are setup, you may run any of the npm tests scripts available:  

```bash
# runs all unit tests with test coverage
npm run test 

# runs all unit tests with test coverage and with watch mode
npm run watch:test
```

## Code Standards

**Linting**

Use are using [StandardJs](https://standardjs.com/) for linting

**Programming style**

Aside from trying to follow common Javascript Best practices we have made an effort to follow a functional programming approach in our codebase, please help us continue with this pattern. 

If you are new to Functional programing there is a lot of good documentation out there, but a good introduction is Eric Elliott's Functional Programming Series. You can start with [What is Functional Programming](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-functional-programming-7f218c68b3a0) and the more in depth [Composing Software](https://medium.com/javascript-scene/the-rise-and-fall-and-rise-of-functional-programming-composable-software-c2d91b424c8c#.2dfd6n6qe) posts are really good.

**Javascript API restrictions**

We want DataPoint to be accessible to users from Node 4.x and above, because of this we would like to stick to Node 4.x full compatibility without the use of any transpilers.

That said, for asynchronous code please rely on using BlueBird's promise api.

## Pull Request Process

1. Fork it
2. Create your feature branch `git checkout -b feature/my-new-feature`
3. Commit your changes through `npm run commit`
4. Push to the branch `git push origin feature/my-new-feature`
5. Create a new [Pull Request](https://github.com/Viacom/data-path/compare)

Please update the [README.md](README.md) with details of changes to the interface.

**Note on commit messages**: All commit messages **must** use [commitizen](http://commitizen.github.io/cz-cli/) format to be accepted, to ensure you use this format, only commit through `npm run commit`.
