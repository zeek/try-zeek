import time
import json
import hashlib
import traceback

import redis

import bro_ascii_reader
import rq
import metrics

from common import get_cache_key, get_redis, get_redis_raw, get_rq

r = get_redis()
r_raw = get_redis_raw()

q = get_rq()

CACHE_EXPIRE = 60*10
SOURCES_EXPIRE = 60*60*24*30

def wait_for_result(r):
    while r.result is None:
        time.sleep(0.1)
    return r.result

BRO_VERSIONS = wait_for_result(q.enqueue("worker.get_bro_versions"))
#Set the default bro version to the most recent version, unless that is master
BRO_VERSION = BRO_VERSIONS[-1]
if BRO_VERSION == 'master' and len(BRO_VERSION) > 1:
    BRO_VERSION = BRO_VERSIONS[-2]

print("Available Zeek versions %r. Using %r as default" % (BRO_VERSIONS, BRO_VERSION))

def get_job_id():
    bro_id = str(r.incr("trybro:id"))
    return bro_id

def run_code(sources, pcap, version=BRO_VERSION):
    """Try to find a cached result for this submission
    If not found, submit a new job to the worker"""
    if version not in BRO_VERSIONS:
        version = BRO_VERSION
    metrics.log_execution(version)
    cache_key = get_cache_key(sources, pcap, version)
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
    result = wait_for_result(q.enqueue("worker.run_code", sources=sources,
                                       pcap=pcap, version=version, job_id=job_id))
    return job_id, result

def run_code_simple(stdin, version=BRO_VERSION):
    sources = [
        {"name": "main.zeek", "content": stdin}
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
    r_raw.set(pcap_key, contents)
    r_raw.expire(pcap_key, 60*60)
    return True

def check_pcap(checksum):
    pcap_key = "pcaps:%s" % checksum
    exists = r_raw.exists(pcap_key)

    if exists:
        r_raw.expire(pcap_key, 60*60)
    return exists
