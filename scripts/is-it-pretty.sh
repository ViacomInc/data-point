#!/bin/bash

node_modules/.bin/prettier-standard '**/*.js'
if [ -z "$(git status --porcelain)" ]; then
  # Working directory clean
  echo 'OK'
  exit 0
else
  # Uncommitted changes
  echo 'BAD'
  exit 1
fi
