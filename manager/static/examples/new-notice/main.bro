@load factorial

event bro_init()
    {
    Log::create_stream(Factor::LOG, [$columns=Factor::Info, $path="factor"]);
    
    local filter: Log::Filter = [$name="split-mod5s", $path_func=Factor::mod5];
    Log::add_filter(Factor::LOG, filter);
    Log::remove_filter(Factor::LOG, "default");
    }

event bro_done()
    {
    local numbers: vector of count = vector(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);    
    for ( i in numbers )
    	{
    	local result = Factor::factorial(numbers[i]);
        Log::write( Factor::LOG, [$num=numbers[i],
                                  $factorial_num=result]);
    	if ( result == Factor::interesting_result)
    		{
	    	NOTICE([$note=Factor::Interesting_Result,
    	 	$msg = "Something happened!",
        	$sub = fmt("result = %d", result)]);
    		}
    	}
    }
    

