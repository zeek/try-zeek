event bro_init()
    {
    local r1 = SumStats::Reducer($stream="dns.lookups", $apply=set(SumStats::TOPK), $topk_size=50);
    SumStats::create([$name="top_dns_lookups",
                      $epoch=12hrs,
                      $reducers=set(r1),
                      $epoch_result(ts: time, key: SumStats::Key, result: SumStats::Result) =
                        {
                        local r = result["dns.lookups"];
                        local s: vector of SumStats::Observation;
                        s = topk_get_top(r$topk, 10);
                        print fmt("Top 10 DNS requests for %D through %D", r$begin, r$end);
                        for ( i in s )
                            {
                            if ( i == 10 )
                                break;

                            print fmt("   Name: %s (estimated count: %d)", s[i]$str, topk_count(r$topk, s[i]));
                            }
                            # Add an extra line for nice formatting.
                            print "";
                        }]);
    }

event dns_request(c: connection, msg: dns_msg, query: string, qtype: count, qclass: count)
    {
    if ( c$id$resp_p == 53/udp && query != "" )
        SumStats::observe("dns.lookups", [], [$str=query]);
    }
