module Factor;

export {
    redef enum Log::ID += { LOG };
    #Append a new notice value to the Notice::Type enumerable.
    redef enum Notice::Type += { Interesting_Result };
    
    const interesting_result = 120 &redef;

    type Info: record {
        num:           count &log;
        factorial_num: count &log;
        };
    global factorial: function(n: count): count;
    global mod5: function(id: Log::ID, path: string, rec: Factor::Info) : string;
    global result : count  = 0;
    }

function factorial(n: count): count
    {
    if ( n == 0 )
        {
    	result = 1;
        return 1;
        }
    
    else
        {
    	result = n * factorial(n - 1);
        return result;
        }
    }
    
function mod5(id: Log::ID, path: string, rec: Factor::Info) : string    
    {
    if ( rec$factorial_num % 5 == 0 )
        return "factor-mod5";
    
    else
        return "factor-non5";
    }
