#!/usr/bin/env python
from optparse import OptionParser
import json
import os
import requests
import sys
import time
import hashlib

DEFAULT_HOST="https://try.zeek.org/"
HOST = os.getenv("TRYBRO_HOST", DEFAULT_HOST)

DEFAULT_VERSION="2.5.5"

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
    res = requests.post(HOST  + "run", data=data, headers=headers).json()
    return res

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

def get_files(job):
    res = requests.get(HOST + "files/" + job)
    file_output = res.json()['files']
    for fn, data in file_output.items():
        if fn == "stdout.log" or not data: continue
        if fn == "stderr.log":
            sys.stderr.write(data)
            continue
        with open(fn, 'w') as f:
            f.write(data)

def run(files, version=DEFAULT_VERSION, pcap=None, link=False):
    if pcap:
        pcap = maybe_upload_pcap(pcap)
    res = run_code(files, version, pcap=pcap)
    if link:
        sys.stdout.write("http://try.zeek.org/#/trybro/saved/%s\n\n" % res['job'])
    sys.stdout.write(res['stdout'])
    get_files(res["job"])

def main():
    parser = OptionParser()
    parser.add_option("-r", "--readfile", dest="pcap", help="read from given tcpdump file", action="store")
    parser.add_option("-l", "--link", dest="link", help="Output sharable link", action="store_true")
    parser.add_option("-V", "--bro-version", dest="version", help="Select bro version", action="store", default=DEFAULT_VERSION)
    (options, args) = parser.parse_args()

    files = args
    run(files, version=options.version, pcap=options.pcap, link=options.link)

if __name__ == "__main__":
    main()
