module FOO;

export {
    redef enum Log::ID += { LOG };

    type Info: record {
      ts: time &log;
      msg: string &log;
    };
}

event bro_init() {
    Log::create_stream(LOG, [$columns=Info]);
    local l = [$ts = network_time(), $msg="hello"];

    Log::write(LOG, l);
    print "Logged";
}
