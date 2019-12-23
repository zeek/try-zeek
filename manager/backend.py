import time
import json
import hashlib
import traceback

from redis import Redis

import bro_ascii_reader
import gm
import metrics


CACHE_EXPIRE = 60*10
SOURCES_EXPIRE = 60*60*24*30

BRO_VERSIONS = gm.get_client().submit_job("get_bro_versions", {}).result
#Set the default bro version to the most recent version, unless that is master
BRO_VERSION = BRO_VERSIONS[-1]
if BRO_VERSION == 'master' and len(BRO_VERSION) > 1:
    BRO_VERSION = BRO_VERSIONS[-2]

print "Available Bro versions %r. Using %r as default" % (BRO_VERSIONS, BRO_VERSION)

r = Redis(host="redis")

def get_job_id():
    return str(r.incr("trybro:id"))

def run_code(sources, pcap, version=BRO_VERSION):
    """Try to find a cached result for this submission
    If not found, submit a new job to the worker"""
    if version not in BRO_VERSIONS:
        version = BRO_VERSION
    metrics.log_execution(version)
    cache_key = "cache:" + hashlib.sha1(json.dumps([sources,pcap,version])).hexdigest()
    job_id = r.get(cache_key)
    if job_id:
        metrics.log_cache_hit()
        r.expire(cache_key, CACHE_EXPIRE)
        r.expire('stdout:%s' % job_id, CACHE_EXPIRE + 5)
        r.expire('files:%s' % job_id, CACHE_EXPIRE + 5)
        r.expire('sources:%s' % job_id, SOURCES_EXPIRE)
        return job_id, get_stdout(job_id)
    job_id = get_job_id()
    job_data = {
        "job_id": job_id,
        "sources": sources,
        "pcap": pcap,
        "version": version
    }
    result = gm.get_client().submit_job("run_code", job_data)
    return job_id, result.result

def run_code_simple(stdin, version=BRO_VERSION):
    sources = [
        {"name": "main.bro", "content": stdin}
    ]
    job_id, stdout = run_code(sources, pcap=None, version=version)
    files = get_files_json(job_id)
    return files

def get_stdout(job):
    stdout_key = 'stdout:%s' % job
    stdout = r.get(stdout_key)
    if stdout:
        r.expire(stdout_key, CACHE_EXPIRE+5)
    return stdout

def get_files(job):
    files_key = 'files:%s' % job
    files = r.hgetall(files_key)
    return files

def get_files_json(job):
    files = get_files(job)
    return parse_tables(files)

def get_saved(job):
    sources_key = 'sources:%s' % job
    return r.get(sources_key)

def parse_tables(files):
    for fn, contents in files.items():
        if contents.startswith("#sep"):
            files[fn] = bro_ascii_reader.reader(contents.splitlines(), max_rows=200)
    return files

def save_pcap(checksum, contents):
    pcap_key = "pcaps:%s" % checksum
    r.set(pcap_key, contents)
    r.expire(pcap_key, 60*60)
    return True

def get_pcap(checksum):
    pcap_key = "pcaps:%s" % checksum
    r.expire(pcap_key, 60*60)
    return r.get(pcap_key)

def get_pcap_with_retry(checksum):
    """There is an annoying race condition where POST /pcap/upload is returning as soon as the pcap is sent, but before
    the request is complete and redis has actually saved it. then run_code
    doesn't find it. so for now, retry here and see if it shows up"""

    for x in range(10):
        contents = get_pcap(checksum)
        if contents:
            return contents
        time.sleep(0.1)
    return None

def check_pcap(checksum):
    pcap_key = "pcaps:%s" % checksum
    exists = r.exists(pcap_key)

    if exists:
        r.expire(pcap_key, 60*60)
    return exists
