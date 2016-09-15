global myhook: hook(s: string);

hook myhook(s: string) &priority = 10
	{
	print "priority 10 myhook handler", s;
	s = "bye";
	}

hook myhook(s: string)
	{
	print "break out of myhook handling", s;
	break;
	}

hook myhook(s: string) &priority = -5
	{
	print "not going to happen", s;
	}

event bro_init() 
	{
	local ret: bool = hook myhook("hi");
	if ( ret )
		{
		print "all handlers ran";
		}
	}
