#!/bin/zsh

# Location of libuv.1.dylib, etc.:
LIBPATH="./cpu/$CPUTYPE/lib"
export DYLD_LIBRARY_PATH="$LD_LIBRARY_PATH:$LIBPATH"

if [ ! -f "$LIBPATH/libuv.1.dylib" ]; then
  echo "$LIBPATH/libuv.1.dylib not found..."
  exit 1
fi

wrap_up() {
  echo "Wrapping up..."

  pid=$(pgrep -lf "Chatty" | grep "next start" | awk '{print $1}')
  if [ -n "$pid" ]; then
    echo "Kill 'next start' process: $pid"
    kill $pid 2>/dev/null
  fi

  # Kill hanging processes.
  processes=$(pgrep -lf "Chatty" | awk '{print $1}')
  if [ -n "$processes" ]; then
    echo "Hanging Chatty processes:"
    echo "$processes"
    while read -r pid; do
      echo "Kill process: $pid"
      kill -15 "$pid"
    done <<<"$processes"
  fi
  echo "Exit"
}

echo "Chatty console."
echo ""
echo "Starting Electron web front-end..."
trap 'wrap_up' INT TERM EXIT
./node_modules/electron/dist/Electron.app/Contents/MacOS/Electron electron.js
echo "Electron was exited..."
