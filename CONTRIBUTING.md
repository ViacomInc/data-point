# Contributing

> Before contributing, please read our [code of conduct](CODE_OF_CONDUCT.md).

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the owners of this repository before making a change. 

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Setup

Make sure you [install Yarn](https://yarnpkg.com/en/docs/install) so you can run the project locally. This project uses [Yarn Workspaces](https://yarnpkg.com/lang/en/docs/workspaces/).

```bash
git clone git@github.com:ViacomInc/data-point.git
cd data-point
yarn install
```

Once you are setup, you may run any of the npm scripts available.

## Running Tests

To run the unit tests you may run any of the following commands:

```bash
# runs all unit tests with test coverage
yarn run test 

# runs all unit tests with test coverage and with watch mode
yarn run watch
```

## Code Standards

**Linting**

We are using [StandardJs](https://standardjs.com/) for linting

**Programming style**

Aside from trying to follow common Javascript best practices we have made an effort to follow a functional programming approach in our codebase, please help us continue with this pattern. 

If you are new to Functional programming there is a lot of good documentation out there, but a good introduction is Eric Elliott's Functional Programming Series. You can start with [What is Functional Programming](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-functional-programming-7f218c68b3a0) and the more in depth [Composing Software](https://medium.com/javascript-scene/the-rise-and-fall-and-rise-of-functional-programming-composable-software-c2d91b424c8c#.2dfd6n6qe) posts are really good.

**Javascript API restrictions**

We want DataPoint to be accessible to users from Node 6.x and above, because of this we would like to stick to Node 6 LTS full compatibility without the use of any transpilers.

That said, for asynchronous code please rely on using BlueBird's promise api.

## Supported Node Versions

We will only be supporting node 6 and above, please make sure the code you use is supported by this version.

## Pull Request Process

1. Fork it
2. Create your feature branch `git checkout -b feature/my-new-feature`
3. Commit your changes through `yarn run commit`
4. Push to the branch `git push origin feature/my-new-feature`
5. Create a new [Pull Request](https://github.com/ViacomInc/data-point/compare)

### Updating Documentation

Please update the respective README.md files with details of changes to the interface.

### Commit message format

All commit messages **must** use [commitizen](http://commitizen.github.io/cz-cli/) format to be accepted, to ensure you use this format, only commit through `yarn run commit`.

### Breaking changes

If your pull request includes a breaking change, please submit it with a [codemod](https://github.com/facebook/jscodeshift) under
data-point-codemods that will help users upgrade their codebase.

Breaking changes without a codemod will not be accepted unless a codemod is not viable or does not apply to the specific situation.
