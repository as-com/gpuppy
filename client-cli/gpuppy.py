#! /usr/bin/env python3

import os
import requests
import tempfile

url = 'http://localhost:3000/api/jobs'

print("Indexing relevant files")
filename = tempfile.mkstemp(suffix='.tar.gz')[1]

os.system("tar -zcvf {} .".format(filename))

print('Pushing tarball to server')
files = {'file': open(filename, 'rb')}
r = requests.post(url, files=files)
print(r.text)
# TODO upload command too
os.unlink(filename)

print("Job queued")
