#!/bin/bash
git fetch --all
git reset --hard origin/main
git clean -fd
echo "Clean pull complete. Server is now synced with GitHub."
