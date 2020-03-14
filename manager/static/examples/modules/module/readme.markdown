title: Writing a Module
pcaps:

Writing a Module
=====================

A module in Zeek is a semantic entity that defines a new name space.
The work flow usually is that solving a problem results in a new module.
A module can be a file or a bundle of files, a package. See below on this page.

It is important to know
that you cannot write new protocol events, you can only react in a different way on an event that is already implemented
in Zeek. Extending Zeek with [new analyzers](https://old.zeek.org/development/howtos/dpd.html) and
creating new events is a topic that is beyond the scope of Try.Zeek.
Usually a module reacts on already existing internal events coming from the Zeek event engine.
Events that are not working on traffic can created within a Zeek script, though.

Before you dive into Zeek Modules we would like to point you on the
[Zeek Scripting Conventions](https://old.zeek.org/development/howtos/script-conventions.html).
Apart from naming conventions the Zeek scripts sets use a convention for file-names and
the setup of Modules. We've already talked about
[loading scripts](http://try.zeek.org/examples/loading). If you have a look into the
[Zeek Script Packages](https://docs.zeek.org/en/current/script-reference/packages.html)
you will find that each Module consists at least of two files, `__load__.bro` and
`main.bro`. The first one should list all files that are part of the module (also `main.bro`)
The directory name in which all those files are collected gives the name to the module.
When loading a module Zeek will look into this directory expecting the `__load__.bro` script.
In this tutorial we will not use this convention most of the time since we keep all examples in Try.Zeek.
If you want to convert the final Zeek Module that we create in this tutorial to test it with your Zeek installation you can also
try the naming conventions for Zeek Modules.

For the next lessons you will need the knowledge from the previous lessons.
