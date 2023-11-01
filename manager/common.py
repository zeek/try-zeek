import hashlib
import json
import os

import redis
import rq

REDIS_HOST = os.environ.get("REDIS_HOST", "redis")

def get_cache_key(sources, pcap, version):
    key = [sources, pcap, version]
    h = hashlib.sha1(json.dumps(key).encode())
    h = h.hexdigest()
    cache_key = f"cache:{h}"
    return cache_key


def get_redis() -> redis.StrictRedis:
    return redis.StrictRedis(REDIS_HOST, charset="utf-8", decode_responses=True)


def get_redis_raw():
    return redis.Redis(REDIS_HOST)


def get_rq():
    return rq.Queue(connection=get_redis_raw())
