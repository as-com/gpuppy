#! /usr/bin/env python3

import os
import requests
import sys
import urllib
import tempfile
import websocket

url_base = 'http://localhost:3000/api/jobs'

print("Indexing relevant files")
filename = tempfile.mkstemp(suffix='.tar.gz')[1]

os.system("tar -zcvf {} .".format(filename))

print('Pushing tarball to server')
files = {'file': open(filename, 'rb')}
parameters = {
    'command': ' '.join(sys.argv[1:]),
    'andrew': 'says hi',
}
print(parameters)
r = requests.post(url_base, params=parameters, files=files)
print(r.text)
os.unlink(filename)

print("Job queued, waiting for execution to begin")
print()

### Streaming Output Back from Servers ###
started = False

def on_message(ws, message):
    global started
    if not started:
        print("Job execution begins below:")
        print("-------------------------------------------")
        started = True
    print(message, end='', flush=True)

def on_error(ws, error):
    print(error)
    exit(1)

def on_close(ws):
    print("Finished build available ???")
    # TODO finish this bit
    exit(0)

job_id = r.json()['job_id']
ws = websocket.WebSocketApp("ws://localhost:3000/api/{}/listen/".format(job_id),
                          on_message = on_message,
                          on_error = on_error,
                          on_close = on_close)

ws.run_forever()
