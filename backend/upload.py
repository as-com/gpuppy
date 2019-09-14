import requests

url = 'http://localhost:5000/api/jobs'
files = {'file': open('sample.tar.gz', 'rb')}

r = requests.post(url, files=files)

print(r.text)
