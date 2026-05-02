import urllib.request
import json

url = input('Enter location: ')
print('Retrieving', url)
uh = urllib.request.urlopen(url)
data = uh.read()
print('Retrieved',len(data),'characters')
info = json.loads(data)
sum= 0
for item in info["comments"]:
    sum += item["count"]
print(sum)   