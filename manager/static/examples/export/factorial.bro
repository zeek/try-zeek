module Factor;

export {
    global factorial: function(n: count): count;
    }
    
function factorial(n: count): count
    {
    if ( n == 0 )
        return 1;
    
    else
        return ( n * factorial(n - 1) );
    }
