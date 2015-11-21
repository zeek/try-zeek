event bro_init() { 
    local x: vector of string = { "one", "two", "three" };
    print x; # [one, two, three]
    print x[1]; # two
    x[|x|] = "one";
    print x; # [one, two, three, one]
    for ( i in x ) print i;  # Iterates over indices.


}
