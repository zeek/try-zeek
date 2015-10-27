title: Namespaces
pcaps: exercise_traffic.pcap
pred: hello
succ: intel

Modules (Namespaces)
=====================

Bro implements namespacing with the module and export keywords.
Every script implicitly starts out in a module named "GLOBAL". 
Identifiers declared within that module are accessible by any other module. 
If a script changes the current module, any identifiers that are subsequently 
declared are only accessible by other modules if they occur within an export block.

In this tutorial we will come back to modules later, explain the structure, and help 
you write your own module. For now we only need to know the concept.

A reference of all scripts that can be loaded is found [here](https://www.bro.org/sphinx/script-reference/scripts.html)

The code here shows a simple script that does nothing else but loading a module. The script 
[misc/dump-events](https://www.bro.org/sphinx/scripts/policy/misc/dump-events.bro.html) dumps 
the events that Bro raises out to standard output in a readable form. This is for debugging only 
and allows to understand events and their parameters as Bro processes input. 
Note that it will show only events for which a handler is defined.

