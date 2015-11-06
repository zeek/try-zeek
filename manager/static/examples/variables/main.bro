global x = "Hello";

event bro_init() { 
	print x;
	
	const y = "Guten Tag";
	# Changing value of 'y' is not allowed.
	#y = "Nope";

	local z = "What does that mean?";
	print z;

}

event bro_done() { 
	x = "Bye";
	print x;
}

