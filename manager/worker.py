#!/usr/bin/env python
import gm
import backend
import sys


def run_code(gearman_worker, gearman_job):
    # job_id, sources, pcap, version
    print "run_code", gearman_job.data
    return backend.really_run_code(**gearman_job.data)

def remove_container(gearman_worker, gearman_job):
    print "remove_container", gearman_job.data
    container = gearman_job.data["container"]
    return backend.remove_container(container)

if __name__ == "__main__":
    sys.stdout = sys.stderr
    gm_worker = gm.get_worker()
    gm_worker.register_task('run_code', run_code)
    gm_worker.register_task('remove_container', remove_container)
    gm_worker.work()
