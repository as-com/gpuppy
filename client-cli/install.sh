#!/bin/bash

export GPUPPY_DIR="$HOME/.gpuppy"

git clone https://github.com/as-com/gpuppy $GPUPPY_DIR
cd $GPUPPY_DIR/client-cli

pip3 install -q requests websocket-client

echo <<EOF
GPUppy is installed in $GPUPPY_DIR
Please add the following command to your shell rc file:

    alias gpuppy="$GPUPPY_DIR/client-cli/gpuppy.py"

EOF
