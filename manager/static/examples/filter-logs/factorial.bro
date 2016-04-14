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
    global mod5: function(id: Log::ID, path: string, rec: Factor::Info) : string;
    }
    
function factorial(n: count): count
    {
    if ( n == 0 )
        return 1;
    
    else
        return ( n * factorial(n - 1) );
    }
    
function mod5(id: Log::ID, path: string, rec: Factor::Info) : string    
    {
    if ( rec$factorial_num % 5 == 0 )
        return "factor-mod5";
    
    else
        return "factor-non5";
    }
