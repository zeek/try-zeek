# Function implementation.
function emphasize(s: string, p: string &default = "*"): string
	{
    	return p + s + p;
	}


event bro_init() { 
   
# Function calls.
	print emphasize("yes");
	print emphasize("no", "_");
 
}
