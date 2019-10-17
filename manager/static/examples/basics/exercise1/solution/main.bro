event zeek_init() 
    { 
    local result = "";

    for ( c in "testing" )
        {
        if ( c != "e" )
	    {
            result = result + c;
            # Compound assignment, ``result += c``, also works.
            }
        }
    print result;
    }

#Recursive approach w/ string concatenation.   
function fizzbuzz(i: count)
    {
    # Modulo, string concatenation approach.
    local s = "";
    
    if ( i % 3 == 0 )
        s += "Fizz";
    
    if ( i % 5 == 0 )
        s += "Buzz";
    
    if ( s == "" )
        print i;
    else
        print s;
    
    if ( i < 100 )
        fizzbuzz(i + 1);
    }

event zeek_done() 
    {
    fizzbuzz(1);
    }
