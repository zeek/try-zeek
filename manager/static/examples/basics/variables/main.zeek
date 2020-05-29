global x = "Hello";

event zeek_init()
	{
	print x;
	
	const y = "Guten Tag";
	# Changing value of 'y' is not allowed.
	#y = "Nope";

	local z = "What does that mean?";
	print z;
	}

event zeek_done()
	{
	x = "Bye";
	print x;
	}

