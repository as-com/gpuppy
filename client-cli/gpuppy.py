#! /usr/bin/env python3

import os
import requests
import sys
import urllib
import tempfile

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

print("Job queued")

# TODO open a websocketttttt
