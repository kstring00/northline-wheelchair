#!/usr/bin/env bash
# Rebuild and (re)start the production server on :3000 for local checks.
set -e
PIDFILE=/tmp/claude-0/next.pid
[ -f "$PIDFILE" ] && kill "$(cat $PIDFILE)" 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
[ "$1" = "--no-build" ] || npm run build 2>&1 | grep -E "rror|✓ Generating" || true
PORT=3000 nohup node_modules/.bin/next start > /tmp/claude-0/next-start.log 2>&1 &
echo $! > $PIDFILE
for i in $(seq 1 40); do curl -s -o /dev/null http://localhost:3000/ && echo "server up" && exit 0; sleep 0.5; done
echo "server failed"; exit 1
