event bro_init() 
    {
    local x : string = "two";
    local y : int = 10000000000000000000000000000000000000000000000000;
    print "y is a large int:", y;
    print "x is a short string:", x;
    
    #pattern matching 
    print /one|two|three/ == "two";  # T
    print /one|two|three/ == "ones"; # F (exact matching)
    print /one|two|three/ in "ones"; # T (embedded matching)
    print /[123].*/ == "2 two";  # T
    print /[123].*/ == "4 four"; # F
    }

