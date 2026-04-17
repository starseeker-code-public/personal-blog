#!/usr/bin/env sh
#
# Container entrypoint — boots uvicorn, runs the test suite against it, and
# only keeps the container alive if every test passes. If anything fails,
# the process exits non-zero so docker restarts/halts per the configured
# policy instead of silently serving a broken build.
#
set -u

uvicorn app.main:app --host 0.0.0.0 --port 8000 &
UVI_PID=$!

# Forward SIGTERM / SIGINT to uvicorn so `docker stop` is clean.
trap 'kill -TERM "$UVI_PID" 2>/dev/null; wait "$UVI_PID" 2>/dev/null; exit' TERM INT

echo "[entrypoint] waiting for backend health..."
ready=0
for _ in $(seq 1 30); do
    if python - <<'PY' >/dev/null 2>&1
import urllib.request
urllib.request.urlopen("http://127.0.0.1:8000/health", timeout=2).read()
PY
    then
        ready=1
        break
    fi
    sleep 1
done

if [ "$ready" -ne 1 ]; then
    echo "[entrypoint] backend never came up — aborting."
    kill "$UVI_PID" 2>/dev/null
    exit 1
fi

echo "[entrypoint] running test suite before accepting traffic..."
export BACKEND_URL="http://127.0.0.1:8000"
if ! pytest -q tests/; then
    echo "[entrypoint] TESTS FAILED — refusing to serve."
    kill "$UVI_PID" 2>/dev/null
    wait "$UVI_PID" 2>/dev/null
    exit 1
fi

echo "[entrypoint] all tests passed — serving."
wait "$UVI_PID"
