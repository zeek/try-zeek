event bro_init()
    {
    local i = 0;

    while ( i < 5 )
    print ++i;

    while ( i % 2 != 0 )
    {
    local finish_up = F;

    if ( finish_up == F )
    	print "nope";
        ++i;
        next;

    if ( finish_up )
        break;
    }
    print i;
    }
