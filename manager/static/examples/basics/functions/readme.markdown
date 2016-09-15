title: Functions
pcaps: 

Functions
==========

Introducing a programming language often encounters mutual dependencies on different pieces of knowledge. 
As a basic part we introduce functions now. To show you a working example we need to use some
elements that are explained later. 

This example function takes one string argument and another optional string argument.
It returns a string. 
The function is declared and implemented at the same time. The function is then called 
within the bro\_init event.

What do we see here?

Input parameters are specified within parentheses in a comma separated list. The return value follows after the colon.
All parameters in this function are of type 'string'. We will see more about types in Bro in the next 
[lesson](http://try.bro.org/example/primitive_datatypes).

The second argument in this example is optional. This is because of the [attribute](https://www.bro.org/sphinx/script-reference/attributes.html) 
&default. In the example here the default value would be '\*' in case the second parameter is missing.

Another element seen here is the '+'-operator that concatenates the strings in this case.

At last when the function is used, the resulting values are simply printed to STDOUT.

Another side note on the relation between functions and events: Events
are a kind of function as well, and both can only be declared at the global
level; one cannot nest them.
