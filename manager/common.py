import hashlib
import json
import redis
import rq


def get_cache_key(sources, pcap, version):
    key = [sources, pcap, version]
    h = hashlib.sha1(json.dumps(key).encode())
    h = h.hexdigest()
    cache_key = f"cache:{h}"
    return cache_key


def get_redis():
    return redis.StrictRedis("redis", charset="utf-8", decode_responses=True)


def get_redis_raw():
    return redis.Redis("redis")


def get_rq():
    return rq.Queue(connection=get_redis_raw())
