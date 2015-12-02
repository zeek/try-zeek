type MyRecord: record 
    {
    a: string &default="hi";
    b: count  &default=7;
    } &redef;

    
redef record MyRecord += 
    {
        c: bool &optional;
        d: bool &default=F;
        #e: bool; # Not allowed, must be &optional or &default.
    };

    const PI = 3.14 &redef;
    redef PI = 3.1415;

    
    
event bro_init() 
    {
    const TWO = 2;
    #redef TWO = 1; # not allowed
    #PI = 5.5;      # not allowed
    print PI;
    print TWO;

    print MyRecord();
    print MyRecord($c=T);
    }

