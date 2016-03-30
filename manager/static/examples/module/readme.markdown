title: Module
pcaps: 
pred: solution-script-exercise-2 
succ: export 

Writing a Module
=====================

In the next lessons of this tutorial you will learn how to write your own module step by step.
A module in Bro is a semantic entity that defines a new name space.
The work flow usually is that solving a problem results in a new module.
A module can be a file or a bundle of files, a package. See below on this page.

It is important to know
that you cannot write new protocol events, you can only react in a different way on an event that is already implemented
in Bro. Extending Bro with [new analyzers](https://www.bro.org/development/howtos/dpd.html) and  
creating new events is a topic that is beyond the scope of try.bro. 
Usually a module reacts on already existing internal events coming from the Bro event engine.
Events that are not working on traffic can created within a bro script, though.

Before you dive into Bro Modules we would like to point you on the
[Bro Scripting Conventions](https://www.bro.org/development/howtos/script-conventions.html).
Apart from naming conventions the Bro scripts sets use a convention for file-names and
the setup of Modules. In the first chapter we already talked about 
[loading scripts](http://try.bro.org/examples/loading). If you have a look into the
[Bro Script Packages](https://www.bro.org/sphinx/script-reference/packages.html)
you will find that each Module consists at least of two files, `__load__.bro` and
`main.bro`. The first one should list all files that are part of the module (also `main.bro`)
The directory name in which all those files are collected gives the name to the module.
When loading a module Bro will look into this directory expecting the `__load__.bro` script.
In this tutorial we will not use this convention most of the time since we keep all examples in try.bro.
If you want to convert the final Bro Module that we create in this tutorial to test it with your Bro installation you can also
try the naming conventions for Bro Modules.

For this tutorial chapter we will assume the knowledge from the previous lessons.
