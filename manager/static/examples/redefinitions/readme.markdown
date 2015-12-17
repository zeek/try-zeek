title: Redefinitions
pcaps: 
pred: record
succ: redef-records

Redefinitions
============================

Bro supports redefining constants, but only at parse-time, not at
run-time.  This feature may not be that useful when writing your own
scripts for private usage, but it's the suggested way for script authors
to advertise "knobs and switches" that one may choose to configure.
These are usually values that one doesn't want to accidentally modify
while Bro is running, but that the author either can't know ahead of
time (e.g. local IP addresses of interest), may differ across
environments (e.g. trusted SSL certificates), or may evolve over
time (e.g. a list of known cipher suites).

Normally, the declaration and the `redef` would live in different
scripts (e.g. the declaration in a script from the "standard library"
that comes with Bro and the `redef` in the script you write), but
this is just an example.

Also, the `&redef` is something called an attribute.  It simply marks
the identifier as one that can be altered via a `redef` statement.
There are other types of attributes, but their behavior ranges
from fairly obvious to rather advanced, so they're not covered
here.  To see all possible attributes please see the [script
reference](http://www.bro.org/sphinx/script-reference/builtins.html).

Run the code and try to uncomment the line 
    
    redef two = 1;

Then uncomment the next line.


