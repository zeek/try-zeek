from redis import Redis
from rq import Queue, get_current_job
import docker
import tempfile
import os
import time
import sys

def queue_run_code(code):
    q = Queue(connection=Redis())
    job = q.enqueue(run_code, code)
    return job

def read_fn(fn):
    with open(fn) as f:
        return f.read()

def run_code(code):
    sys.stdout = sys.stderr
    code = code.replace("\r\n", "\n") + "\n"
    job = get_current_job()
    work_dir = tempfile.mkdtemp(dir="/brostuff")
    code_fn = os.path.join(work_dir,"code.bro")
    with open(code_fn, 'w') as f:
        f.write(code)
    
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
    r = Redis()
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
