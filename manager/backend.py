import codecs
import os
import sys
import shutil
import tempfile
import time
import json
import hashlib

import docker
from redis import Redis
from rq import Queue, get_current_job
from rq.job import Job

import bro_ascii_reader

BRO_VERSION = "2.3"
BRO_VERSIONS = ["2.2", "2.3", "master"]

CACHE_EXPIRE = 60*10
SOURCES_EXPIRE = 60*60*24*3

r = Redis()

def queue_remove_container(container):
    q = Queue(connection=r)
    job = q.enqueue(remove_container, container)
    return job

def remove_container(container):
    with r.lock("docker", 5) as lck:
        c = docker.Client(version='1.11')
        for x in range(5):
            try :
                c.remove_container(container)
                return "removed %r" % container
            except:
                time.sleep(1)

def queue_run_code(sources, pcap, version=BRO_VERSION):
    cache_key = hashlib.sha1(json.dumps([sources,pcap,version])).hexdigest()
    job_id = r.get(cache_key)
    if job_id:
        with r.pipeline() as pipe:
            pipe.expire(cache_key, CACHE_EXPIRE)
            pipe.expire('rq:job:%s' % job_id, CACHE_EXPIRE + 5)
            pipe.expire('files:%s' % job_id, CACHE_EXPIRE + 5)
            pipe.expire('sources:%s' % job_id, SOURCES_EXPIRE)
            pipe.execute()
        return job_id
    q = Queue(connection=r)
    job = q.enqueue(run_code, sources, pcap, version)
    return job.id

def read_fn(fn):
    with open(fn) as f:
        return f.read()

def run_code(sources, pcap=None, version=BRO_VERSION):
    if version not in BRO_VERSIONS:
        version = BRO_VERSION
    cache_key = hashlib.sha1(json.dumps([sources,pcap,version])).hexdigest()
    sys.stdout = sys.stderr
    for s in sources:
        s['content'] = s['content'].replace("\r\n", "\n")
        s['content'] = s['content'].rstrip() + "\n"
    job = get_current_job()
    work_dir = tempfile.mkdtemp(dir="/brostuff")
    for s in sources:
        code_fn = os.path.join(work_dir,s['name'])
        with codecs.open(code_fn, 'w', encoding="utf-8") as f:
            f.write(s['content'])

    if pcap:
        dst = os.path.join(work_dir, "file.pcap")
        if '.' in pcap:
            src = os.path.join("/pcaps", pcap)
            os.symlink(src, dst)
        else:
            contents = get_pcap_with_retry(pcap)
            if contents:
                with open(dst, 'w') as f:
                    f.write(contents)

    #docker run -v /brostuff/tmpWh0k1x:/brostuff/ -n --rm -t -i  bro_worker /bro/bin/bro /brostuff/code.bro

    print "Connecting to docker...."
    with r.lock("docker", 5) as lck:
        c = docker.Client(version='1.11')

        print "Creating container.."
        volumes = {work_dir: {}}
        container = c.create_container('bro_worker',
            command="/runbro %s" % version,
            volumes=volumes,
            mem_limit="128m",
            network_disabled=True,
        )
        print "Starting container.."
        c.start(container, dns="127.0.0.1", binds={
            work_dir: work_dir,
        })

    print "Waiting.."
    c.wait(container)

    print "Removing Container"
    queue_remove_container(container)

    stdout = ''
    files_key = 'files:%s' % job.id
    sources_key = 'sources:%s' % job.id

    for f in os.listdir(work_dir):
        if not f.endswith(".log"): continue
        full = os.path.join(work_dir, f)
        txt = read_fn(full)
        #print "Setting", f, txt
        r.hset(files_key, f, txt)
        if f == 'stdout.log':
            stdout = txt
    r.expire(files_key, CACHE_EXPIRE+5)
    shutil.rmtree(work_dir)

    r.set(cache_key, job.id)
    r.expire(cache_key, CACHE_EXPIRE)

    r.set(sources_key, json.dumps(dict(sources=sources, pcap=pcap, version=version)))
    r.expire(sources_key, SOURCES_EXPIRE)
    return stdout

def get_stdout(job):
    for x in range(10):
        j = Job.fetch(job, connection=r)
        if j.result:
            return j.result
        time.sleep(.1)
    return j.result

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
