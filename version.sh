#!/bin/bash
if [[ "$1" != "patch" && "$1" != "minor" && "$1" != "major" ]]; then
    echo "Usage: $0 [patch|minor|major]"
    exit 1
fi

npm version "$1"
git push
git push --tags