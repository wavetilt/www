#!/usr/bin/env bash
set -euo pipefail
npm run build
cp -R src/img public/img
