const pi = 3.14 &redef;
redef pi = 3.1415;

event zeek_init() 
	{
	const two = 2;
	#redef two = 1; # not allowed
	#pi = 5.5;      # not allowed
	print pi;
	print two;
	}

