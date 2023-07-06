#!/usr/bin/env python3 -u
import asyncio
import codecs
import docker
import hashlib
import json
import os
import shutil
import time
import tempfile
import traceback
import rq

from common import get_cache_key, get_redis, get_redis_raw

CACHE_EXPIRE = 60*10
SOURCES_EXPIRE = 60*60*24*30

r = get_redis()
r_raw = get_redis_raw()

background_tasks = set()


def read_fn(fn):
    with open(fn) as f:
        return f.read()


def get_bro_versions():
    c = docker.Client()
    images = c.images(name='zeek/zeek')
    tags = [i['RepoTags'][0] for i in images]
    versions = [t.replace("zeek/zeek:", "") for t in tags if '_' not in t]
    return sorted(versions)

def get_pcap(checksum):
    pcap_key = "pcaps:%s" % checksum
    r_raw.expire(pcap_key, 60*60)
    return r_raw.get(pcap_key)

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


BRO_VERSIONS = get_bro_versions()
#Set the default bro version to the most recent version, unless that is master
BRO_VERSION = BRO_VERSIONS[-1]
if BRO_VERSION == 'master' and len(BRO_VERSION) > 1:
    BRO_VERSION = BRO_VERSIONS[-2]

def run_code(sources, pcap=None, version=BRO_VERSION):
    job = rq.get_current_job()
    if type(job) is bytes:
        job = job.decode()
    return really_run_code(job.id, sources, pcap=pcap, version=version)


def really_run_code(job_id, sources, pcap=None, version=BRO_VERSION):
    if version not in BRO_VERSIONS:
        version = BRO_VERSION
    cache_key = get_cache_key(sources, pcap, version)
    stdout_key = 'stdout:%s' % job_id
    files_key = 'files:%s' % job_id
    sources_key = 'sources:%s' % job_id

    file_output = run_code_docker(sources, pcap, version)

    stdout=""
    for f, txt in file_output.items():
        if not f.endswith(".log"): continue
        r.hset(files_key, f, txt)
        if f == 'stdout.log':
            stdout = txt
    r.expire(files_key, CACHE_EXPIRE+5)

    r.set(stdout_key, stdout)
    r.expire(stdout_key, CACHE_EXPIRE+5)

    r.set(sources_key, json.dumps(dict(sources=sources, pcap=pcap, version=version)))
    r.expire(sources_key, SOURCES_EXPIRE)

    r.set(cache_key, job_id)
    r.expire(cache_key, CACHE_EXPIRE)
    return stdout

def run_code_docker(sources, pcap=None, version=BRO_VERSION):
    with tempfile.TemporaryDirectory(dir="/brostuff") as work_dir:
        return _run_code_docker(sources, pcap=pcap, version=version, work_dir=work_dir)
def _run_code_docker(sources, pcap, version, work_dir):
    if version not in BRO_VERSIONS:
        version = BRO_VERSION

    for s in sources:
        s['content'] = s['content'].replace("\r\n", "\n")
        s['content'] = s['content'].rstrip() + "\n"

    runbro_path = os.path.join(work_dir, "runbro")
    for s in sources:
        code_fn = os.path.join(work_dir, s['name'])
        with codecs.open(code_fn, 'w', encoding="utf-8") as f:
            f.write(s['content'])

    runbro_src = "./runbro"
    runbro_src_version_specific = "%s-%s" % (runbro_src, version)
    if os.path.exists(runbro_src_version_specific):
        runbro_src = runbro_src_version_specific

    shutil.copy(runbro_src, runbro_path)
    os.chmod(runbro_path, 0o755)

    binds = {work_dir: {"bind": work_dir, "mode": "rw"}}

    if pcap:
        dst = os.path.join(work_dir, "file.pcap")
        if '.' in pcap:
            src = os.path.join(os.getcwd(), "static/pcaps", pcap)
            #FIXME: Work out a better way to share pcaps around
            #binds[src]={"bind": dst, "ro": True}
            shutil.copy(src, dst)
        else:
            contents = get_pcap_with_retry(pcap)
            if contents:
                with open(dst, 'wb') as f:
                    f.write(contents)

    #docker run -v /brostuff/tmpWh0k1x:/brostuff/ -n --rm -t -i  bro_worker /bro/bin/bro /brostuff/code.bro

    print("Connecting to docker....")
    c = docker.Client()

    print("Creating Bro %s container.." % version)
    host_config = docker.utils.create_host_config(
        binds=binds,
        dns=["127.0.0.1"],
        mem_limit="128m",
        network_mode="none",
        read_only=True,
    )
    container = c.create_container('zeek/zeek:' + version,
        working_dir=work_dir,
        command=runbro_path,
        host_config=host_config,
        volumes=[work_dir],
    )
    print("Starting container..")
    try:
        c.start(container)

        print("Waiting..")
        c.wait(container)

    finally:
        print("Removing Container")
        c.remove_container(container)

    files = {}
    for f in os.listdir(work_dir):
        if not f.endswith(".log"): continue
        full = os.path.join(work_dir, f)
        txt = read_fn(full)
        if txt.strip() or 'stdout' in f:
            files[f] = txt
    return files
