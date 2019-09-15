#! /usr/bin/env python3

import os
import requests
import sys
import urllib
import tempfile
import websocket

server = "localhost:3000"
url_base = 'http://{}'.format(server)

print("Indexing relevant files")
filename = tempfile.mkstemp(suffix='.tar.gz')[1]

os.system("tar --exclude .git -zcvf {} .".format(filename))

print('Pushing tarball to server')
files = {'file': open(filename, 'rb')}
parameters = {
    'command': ' '.join(sys.argv[1:]),
}
print(parameters)
r = requests.post(url_base + '/api/jobs', params=parameters, files=files)
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
    get_results()
    exit(0)

job_id = r.json()['job_id']
ws = websocket.WebSocketApp("ws://localhost:3000/api/{}/listen/".format(job_id),
                          on_message = on_message,
                          on_error = on_error,
                          on_close = on_close)

ws.run_forever()

### Download Results
SYNC = True

def get_results():
    print("-------------------------------------------")
    print("Fetching artifacts from the server")
    result_url = '{}/api/artum/{}.tar.gz'.format(url_base, job_id)
    #print(result_url)

    output_dir = "gpuppy-results-{}".format(job_id)

    command = "mkdir {} && wget -qO- {} | tar xvz -C {}".format(output_dir, result_url, output_dir)
    #print(command)
    os.system(command)

    if SYNC:
        sync_cmd = " rsync -auv --recursive {}/ ./ && rm -r {}".format(output_dir, output_dir)
        os.system(sync_cmd)
        print()
        print("Job execution finished")
    else:
        print()
        print("Your results are available in the {}/ directory".format(output_dir))

get_results()
