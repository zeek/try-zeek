title: Loading
pcaps: 
pred: hello
succ: functions

Loading Scripts
===============

Like most programming languages, Bro has the ability to load in script code 
from other files.  There is a directive, `@load` which provides the capability.

The code here shows a simple script that does nothing but loading a script. The script [misc/dump-events](https://www.bro.org/sphinx/scripts/policy/misc/dump-events.bro.html) prints the events that Bro generates out to standard output in a readable form. This is for debugging only and can be used to help understand events and their parameters. Note that it will show only events for which a handler is defined.

A small note needs to be made here because there are some default paths defined by Bro automatically which make it easier to load many of the scripts that are included with Bro. The default paths are as follows (based on the installed prefix directory): 

  - `<prefix>/share/bro`
  - `<prefix>/share/bro/policy`
  - `<prefix>/share/bro/site`

The most common use case of the load statement is in [local.bro](https://www.bro.org/sphinx/components/broctl/README.html#site-specific-customization).
This file is part of Bro's configuration files and adds further scripts that are not loaded by default. A reference of all scripts that can be loaded is found [here](https://www.bro.org/sphinx/script-reference/scripts.html).
Everything you see there in `base/` is loaded by default, e.g., policies have to be loaded via the load statement.


