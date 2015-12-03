type MyRecord: record {
	a: string;
	b: count;
	c: bool &default = T;
	d: int &optional;
};

event bro_init() 
	{ 
	local x = MyRecord($a = "vvvvvv", $b = 6, $c = F, $d = -13);
	if ( x?$d )
		{
		print x$d;
		}
	
	x = MyRecord($a = "abc", $b = 3);
	print x$c;  # T (default value of the field)
	print x?$d; # F (optional field was not set)
	}
