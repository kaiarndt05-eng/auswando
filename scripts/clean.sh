#!/bin/bash
# Remove node_modules and reinstall from scratch
set -e

echo "Removing node_modules..."
rm -rf node_modules

echo "Clearing npm cache..."
npm cache clean --force

echo "Reinstalling dependencies..."
npm install

echo "Done."
