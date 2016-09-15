type MyRecord: record {
	a: string &default="hi";
	b: count  &default=7;
} &redef;

redef record MyRecord += {
	c: bool &optional;
	d: bool &default=F;
	#e: bool; # Not allowed, must be &optional or &default.
};

event bro_init() 
	{
	print MyRecord();
	print MyRecord($c=T);
	}

