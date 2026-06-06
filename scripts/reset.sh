#!/bin/bash
# Clear Expo cache and restart dev server
set -e

echo "Clearing Expo cache..."
npx expo start --clear
