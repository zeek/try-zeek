module Factor;

export {
    # Append the value LOG to the Log::ID enumerable.
    redef enum Log::ID += { LOG };

    # Define a new type called Factor::Info.
    type Info: record {
        num:           count &log;
        factorial_num: count &log;
        };
    global factorial: function(n: count): count;
    }
    
function factorial(n: count): count
    {
    if ( n == 0 )
        return 1;
    
    else
        return ( n * factorial(n - 1) );
    }
