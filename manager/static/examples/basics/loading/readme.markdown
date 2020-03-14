title: Loading Scripts
pcaps: 

Loading Scripts
===============

Like most programming languages, Zeek has the ability to load in script code 
from other files.  There is a directive, `@load` which provides the capability.

The code here shows a simple script that does nothing but loading a script. The script [misc/dump-events](https://docs.zeek.org/en/current/scripts/policy/misc/dump-events.bro.html) prints the events that Zeek generates out to standard output in a readable form. This is for debugging only and can be used to help understand events and their parameters. Note that it will show only events for which a handler is defined.

A small note needs to be made here because there are some default paths defined by Zeek automatically which make it easier to load many of the scripts that are included with Zeek. The default paths are as follows (based on the installed prefix directory): 

  - `<prefix>/share/bro`
  - `<prefix>/share/bro/policy`
  - `<prefix>/share/bro/site`

The most common use case of the load statement is in [local.bro](https://docs.zeek.org/en/current/components/broctl/README.html#site-specific-customization).
This file is part of Zeek's configuration files and adds further scripts that are not loaded by default. A reference of all scripts that can be loaded is found [here](https://docs.zeek.org/en/current/script-reference/scripts.html).
Everything you see there in `base/` is loaded by default, e.g., policies have to be loaded via the load statement.


