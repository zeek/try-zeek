title: Functions
pcaps: 
pred: namespaces
succ: variables

Functions
==========

Introducing a programming language often mutual dependencies on pieces of knowledge. 
As a basic part we introduce functions now. To show you a working example we need to use some
elements that are explained later. 

This example function takes one string argument and another optional string argument.
It returns a string. 
The function is first declared and implemented at the same time. The function is then called 
within the init-event.

What do we see here?

Input variables are within the braces in a comma separated list. The return value follows after the colon.
All variables in this function are of type 'string'. We will see more about types in Bro in the second next 
[chapter](http://try.bro.org/example/primitive_datatypes).
A few more details about variables in Bro are given in the next [chapter](http://try.bro.org/example/primitive\_datatypes).

The second argument in this example is optional. This is because of the [attribute](https://www.bro.org/sphinx/script-reference/attributes.html) 
&default. In the example here the default value would be '\*' in case the second variable is missing.

Another element seen here is the '+'-operator that concatenates the strings in this case.

At last when the function is used, the resulting values are simply printed to STDOUT.

Another side note on the relation between functions and events: Events are a kind of function. This is why all declarations of
functions must be placed outside of an event.
