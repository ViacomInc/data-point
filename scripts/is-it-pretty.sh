#!/bin/bash

node_modules/.bin/prettier-standard '**/*.js'
if [ -z "$(git status --porcelain)" ]; then
  # Working directory clean
  exit 0
else
  # Uncommitted changes
  echo 'There are javascript files in this project that do not pass prettier-standard.'
  echo 'To avoid this error make commits by using the "yarn run commit" command.'
  echo 'For more info: https://github.com/ViacomInc/data-point/blob/master/CONTRIBUTING.md\n'
  echo "$(git diff --name-only)"
  exit 1
fi
