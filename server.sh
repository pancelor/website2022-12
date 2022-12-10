#!/usr/bin/env bash

echo "remember to turn off caching in the network tab"
echo "localhost:8000"
echo ""

python -m http.server --directory docs
# http-server docs -c-1 -p 8000
