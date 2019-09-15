#!/bin/bash

export GPUPPY_DIR="$HOME/.gpuppy"

if [ -d $GPUPPY_DIR ]; then
    cd $GPUPPY_DIR
    git pull
else
    git clone https://github.com/as-com/gpuppy $GPUPPY_DIR
    cd $GPUPPY_DIR
fi
cd client-cli

echo "Installing dependencies"
pip3 install requests websocket-client

cat <<EOF

GPUppy is installed in $GPUPPY_DIR
Please add the following command to your shell rc file:

    alias gpuppy="$GPUPPY_DIR/client-cli/gpuppy.py"

EOF
