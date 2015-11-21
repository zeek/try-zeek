event bro_init() { 
    local x: set[string] = { "one", "two", "three" };
    add x["four"];
    print "four" in x; # T
    delete x["two"];
    print "two" !in x; # T
    add x["one"]; # x is unmodified since 1 is already a member.
    for ( e in x ) print e;

}

