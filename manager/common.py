import hashlib
import json
import os
import re

import redis
import rq

REDIS_HOST = os.environ.get("REDIS_HOST", "redis")

PCAP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "pcaps")
PCAP_CHECKSUM_RE = re.compile(r"^[0-9a-f]{32}$")


def is_plain_filename(name) -> bool:
    """
    True if name is a single path component, so joining it onto a
    directory can't point anywhere outside that directory.
    """
    return (isinstance(name, str) and name not in ("", ".", "..")
            and not any(c in name for c in "/\\\0"))


def is_pcap_checksum(pcap) -> bool:
    """True if pcap is the md5 checksum of an uploaded pcap."""
    return isinstance(pcap, str) and PCAP_CHECKSUM_RE.match(pcap) is not None


def is_valid_pcap(pcap, pcap_dir=PCAP_DIR) -> bool:
    """
    True if pcap is empty (no pcap), the checksum of an uploaded pcap, or
    the name of a bundled pcap in pcap_dir.
    """
    if not pcap or is_pcap_checksum(pcap):
        return True
    return is_plain_filename(pcap) and os.path.isfile(os.path.join(pcap_dir, pcap))

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
