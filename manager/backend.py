from redis import Redis
from rq import Queue, get_current_job
from rq.job import Job
import docker
import tempfile
import os
import time
import sys

import bro_ascii_reader

r = Redis()

def queue_run_code(code, pcap):
    q = Queue(connection=r)
    job = q.enqueue(run_code, code, pcap)
    return job

def read_fn(fn):
    with open(fn) as f:
        return f.read()

def run_code(code, pcap=None):
    sys.stdout = sys.stderr
    code = code.replace("\r\n", "\n") + "\n"
    job = get_current_job()
    work_dir = tempfile.mkdtemp(dir="/brostuff")
    code_fn = os.path.join(work_dir,"code.bro")
    with open(code_fn, 'w') as f:
        f.write(code)

    if pcap:
        src = os.path.join("/pcaps", pcap)
        dst = os.path.join(work_dir, "file.pcap")
        os.symlink(src, dst)
    
    #docker run -v /brostuff/tmpWh0k1x:/brostuff/ -n --rm -t -i  bro_test1 /bro/bin/bro /brostuff/code.bro

    print "Connecting to docker...."
    c = docker.Client()
    print c.info()

    print "Creating container.."
    volumes = {work_dir: {}}
    container = c.create_container('bro_test1',
        command="/runbro",
        volumes=volumes,
        mem_limit="128m",
        network_disabled=True,
    )
    print "Starting container.."
    c.start(container, binds={
        work_dir: work_dir,
    })

    print "Waiting.."
    c.wait(container)

    print "Removing Container"
    c.remove_container(container)

    stdout = ''
    files_key = 'files:%s' % job.id

    for f in os.listdir(work_dir):
        if not f.endswith(".log"): continue
        full = os.path.join(work_dir, f)
        txt = read_fn(full)
        print "Setting", f, txt
        r.hset(files_key, f, txt)
        if f == 'stdout.log':
            stdout = txt
    return stdout

def get_stdout(job):
    j = Job.fetch(job, connection=r)
    return j.result

def get_files(job):
    files_key = 'files:%s' % job
    files = r.hgetall(files_key)
    return parse_tables(files)

def parse_tables(files):
    for fn, contents in files.items():
        if contents.startswith("#sep"):
            files[fn] = bro_ascii_reader.reader(contents.splitlines())
    return files

