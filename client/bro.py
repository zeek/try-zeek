#!/usr/bin/env python
from optparse import OptionParser
import json
import requests
import sys
import time
import hashlib
HOST="http://brototype.ncsa.illinois.edu/"

DEFAULT_VERSION="2.3"

def md5(s):
    m = hashlib.md5()
    m.update(s)
    return m.hexdigest()

def read_file(fn):
    with open(fn) as f:
        return f.read()

def run_code(files, version=DEFAULT_VERSION, pcap=None):
    main, rest = files[0], files[1:]
    sources = [
        {"name": "main.bro", "content": read_file(main)}
    ]

    for fn in rest:
        sources.append({"name": fn, "content": read_file(fn)})

    req = {
        "sources": sources,
        "version": version,
        "pcap": pcap,
    }
    data = json.dumps(req)
    headers = {'Content-type': 'application/json'}
    return requests.post(HOST  + "run", data=data, headers=headers).json()["job"]

def maybe_upload_pcap(pcap):
    with open(pcap) as f:
        contents = f.read()
    checksum = md5(contents)

    exists = requests.get(HOST + "pcap/" + checksum).json()["status"]
    if not exists:
        files = {'pcap': ('file.pcap', contents) }
        status = requests.post(HOST + "pcap/upload/" + checksum, files=files).json()['status']
        assert status

    return checksum

def wait(job):
    while True:
        res = requests.get(HOST + "stdout/" + job)
        if res.status_code != 202:
            break
        print "waiting..."
        time.sleep(.1)
    res.raise_for_status()
    return res.json()

def get_files(job):
    res = requests.get(HOST + "files/" + job)
    file_output = res.json()['files']
    for fn, data in file_output.items():
        if fn == "stdout.log" or not data: continue
        with open(fn, 'w') as f:
            f.write(data)

def run(files, version=DEFAULT_VERSION, pcap=None):
    if pcap:
        pcap = maybe_upload_pcap(pcap)
    job = run_code(files, version, pcap=pcap)
    print wait(job)['txt']
    get_files(job)

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-r", "--readfile", dest="pcap", help="read from given tcpdump file", action="store")
    parser.add_option("-V", "--bro-version", dest="version", help="Select bro version", action="store", default=DEFAULT_VERSION)
    (options, args) = parser.parse_args()

    files = args
    run(files, version=options.version, pcap=options.pcap)
