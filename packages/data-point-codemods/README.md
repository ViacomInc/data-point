# DataPoint codemods

> Codemods to help upgrade to newer versions of [data-point](https://github.com/ViacomInc/data-point/)

Codemods, or [jscodeshift](https://github.com/facebook/jscodeshift) transforms, are small programs that help automate changes in a codebase. Think of them as search and replace on steroids. 

## Install

Globally install data-point-codemods:

```bash
$ npm install -g data-point-codemods
```

This will install a binary `data-point-codemods`.

## Usage

```bash
data-point-codemods <path> [options]
```

This tool uses [lib-upgrader](#https://github.com/jfmengels/lib-upgrader) to run the codemods. 

When executed it will ask you about the version you currently are, and the one you wish to upgrade to, after that it will attempt at executing all the codemods to upgrade your code. 

### Help

For help type: 

```bash
data-point-codemods --help
```

## Supported codemods

**Upgrading 1.x &rarr; 2.x**

- ([codemod](transforms/reducer-args-acc-to-val-acc.js)) Refactor ReducerFunctions for value as first parameter eg. `(acc)` &rarr; `(input, acc)`. For more info please look at the [input](transforms/__testfixtures__/reducer-args-acc-to-val-acc.input.js)/[output](transforms/__testfixtures__/reducer-args-acc-to-val-acc.output.js) tests.

- ([codemod](transforms/change-path-reducer-accessing-root-path.js)) Refactor PathReducers that access the root with `$.` to use `$`. For more info please look at the [input](transforms/__testfixtures__/change-path-reducer-accessing-root-path.input.js)/[output](transforms/__testfixtures__/change-path-reducer-accessing-root-path.output.js) tests.

## WARNING

Make sure you backup your files, these tests will overwrite their content. The codemods try to cover the most use cases possible, but there might be cases where they end up breaking your code.

codemods might change your formatting.

## Example of how a run may look: 

```bash
$ data-point-codemods src/data/
? What version of data-point are you currently using? older than 2.0.0
? What version of data-point are you moving to? 2.0.0 (latest)

For similar projects, you may want to run the following command:
    data-point-codemods --from 0.0.0 --to 2.0.0 "src/data/"
```
