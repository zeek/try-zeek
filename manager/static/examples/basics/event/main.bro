global myevent: event(s: string);

global n = 0;

event myevent(s: string) &priority = -10
	{
	++n;
	}

event myevent(s: string) &priority = 10
	{
	print "myevent", s, n;
	}

event bro_init()
	{
	print "bro_init()";
	event myevent("hi");
	schedule 5 sec { myevent("bye") };
	}

event bro_done()
	{
	print "bro_done()";
	}

