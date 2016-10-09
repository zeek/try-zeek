event bro_init() 
    { 
    local result = 0;
    local input = "The Bro Network Security Monitor";
    for ( c in input )
        {
        switch ( c ) 
            {
            case "a", "e", "i", "o", "u":
                ++result;
                break;
            }
        }
    print result;
    }
