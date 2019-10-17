event zeek_init() 
    { 
    local x = 4;

    switch ( x ) 
        {
        case 0:
            # This block only executes if x is 0.
            print "case 0";
            break;
        case 1, 2, 3:
            # This block executes if any of the case labels match.
            print "case 1, 2, 3";
            break;
        case 4:
            print "case 4 and ...";
            # Block ending in the "fallthrough" also execute subsequent case.
            fallthrough;
        case 5:
            # This block may execute if x is 4 or 5.
            print "case 5";
            break;
        default:
            # This block executed if no other case matches.
            print "default case";
            break;
        }
    }    


