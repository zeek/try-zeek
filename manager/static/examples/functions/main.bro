# Optional function declaration.
# Takes one required string argument
# and another optional string argument
# and returns a string value.

global emphasize: function(s: string, p: string &default = "*"): string;

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
