import datetime
from redis import Redis
r = Redis(host="redis")

def log_execution(version):
    date = datetime.datetime.today().strftime("%Y-%m-%d")
    r.incr("trybro:metrics:executions")
    r.hincrby("trybro:metrics:executions_bydate", date, 1)
    r.hincrby("trybro:metrics:executions_byversion", version, 1)

def log_cache_hit():
    r.incr("trybro:metrics:cache_hits")

def get():
    return {
        "executions":    r.get("trybro:metrics:executions"),
        "cache_hits":    r.get("trybro:metrics:cache_hits"),
        "bydate":    r.hgetall("trybro:metrics:executions_bydate"),
        "byversion": r.hgetall("trybro:metrics:executions_byversion"),
    }
