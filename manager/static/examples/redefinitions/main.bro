type MyRecord: record {
	a: string &default="hi";
	b: count  &default=7;
} &redef;

redef record MyRecord += {
	c: bool &optional;
	d: bool &default=F;
	#e: bool; # Not allowed, must be &optional or &default.
};

const pi = 3.14 &redef;
redef pi = 3.1415;

event bro_init() 
	{
	const two = 2;
	#redef two = 1; # not allowed
	#pi = 5.5;      # not allowed
	print pi;
	print two;

	print MyRecord();
	print MyRecord($c=T);
	}

