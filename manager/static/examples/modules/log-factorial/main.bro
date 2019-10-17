@load factorial

event zeek_init()
    {
    # Create the logging stream.
    Log::create_stream(Factor::LOG, [$columns=Factor::Info, $path="factor"]);
    }

event zeek_done()
    {
    local numbers: vector of count = vector(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);    
    for ( n in numbers )
        Log::write( Factor::LOG, [$num=numbers[n],
                                  $factorial_num=Factor::factorial(numbers[n])]);
    }
