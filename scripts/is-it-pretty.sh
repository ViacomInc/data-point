#!/bin/bash

node_modules/.bin/prettier-standard '**/*.js'
if [ -z "$(git status --porcelain)" ]; then
  # Working directory clean
  exit 0
else
  # Uncommitted changes
  echo 'There are javascript files in this project that do not follow the prettify standard!'
  exit 1
fi
