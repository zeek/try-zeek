title: Functions
pcaps: exercise_traffic.pcap
pred: namespaces
succ: variables

Functions
==========

TODO: Example does not run!
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

# Function calls.
print emphasize("yes");
print emphasize("no", "_");
