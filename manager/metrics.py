import datetime
from redis import Redis
r = Redis()

def log_execution(version):
    date = datetime.datetime.today().strftime("%Y-%m-%d")
    r.incr("trybro:metrics:execution")
    r.hincrby("trybro:metrics:bydate", date, 1)
    r.hincrby("trybro:metrics:byversion", version, 1)

def log_cache_hit():
    r.incr("trybro:metrics:cache_hit")
