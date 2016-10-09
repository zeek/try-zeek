@load base/frameworks/sumstats

redef enum Notice::Type += 
	{
    ExcessiveRequests
	};

const excessive_limit: double = 10  &redef;

event bro_init()
    {
    local r1 = SumStats::Reducer($stream="dns.lookup", $apply=set(SumStats::SUM));
    SumStats::create([$name="dns.requests",
                      $epoch=6hrs,
                      $threshold = excessive_limit,
                      $reducers=set(r1),
                      $threshold_val(key: SumStats::Key, result: SumStats::Result) = 
                      	{
                        return result["dns.lookup"]$sum;
                      	},
                      $threshold_crossed(key: SumStats::Key, result: SumStats::Result) = 
                      	{
                        local r = result["dns.lookup"];
                        NOTICE([
                            $note=ExcessiveRequests,
                            $src=key$host,
                            $msg=fmt("%s has made more than %.0f DNS requests.", key$host, r$sum),
                            $sub=cat(r$sum),
                            $identifier=cat(key$host)
                          ]);
                      	}
                    ]);
    }

event dns_request(c: connection, msg: dns_msg, query: string, qtype: count, qclass: count)
    {
    if ( c$id$resp_p == 53/udp && query != "" )
        SumStats::observe("dns.lookup", [$host=c$id$orig_h], [$str=query]);
    }

