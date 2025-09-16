#!/bin/bash
# Vercel build script for CA Lobby webapp

echo "Building CA Lobby frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Build complete!"