#!/bin/bash
set -e
# PostgreSQL database name for koop
cd $APP_DIR
echo "Starting the koop server..."
exec node server.js

