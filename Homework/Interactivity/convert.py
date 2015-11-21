import json
import datetime

data = []
with open('data.txt','r') as datafile:
    for line in datafile:
        splitted = line.split(',')
        date = datetime.datetime.strptime(splitted[1], '%Y%m%d')
        temperature = int(splitted[2].strip()) / 10
        data.append({'x' : date.strftime('%Y/%m/%d'), 'y': temperature})

with open('test.json')
print(data)
