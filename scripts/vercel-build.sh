#!/bin/bash
set -e

echo "=== Installing all workspace dependencies ==="
npm install

echo "=== Building client with Vite ==="
cd packages/client
npx vite build

echo "=== Build complete ==="
