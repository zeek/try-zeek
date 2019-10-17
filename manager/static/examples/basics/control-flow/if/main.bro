event zeek_init() 
	{ 
	local x = "3";

	for ( c in "12345" )
		{
		if ( c == x )
			{
			print "Found it.";
			# A preview of functions: fmt() does substitutions, outputs result.
			print fmt("And by 'it', I mean %s.", x);
			}
		else
			{
			# A quick way to print multiple things on one line.
			print "I'm looking for", x, "not", c;
			}
		}
	}


