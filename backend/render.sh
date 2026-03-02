#!/bin/bash
set -e

echo "Building Career Navigator Backend for Render..."

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

echo "Build completed successfully!"
