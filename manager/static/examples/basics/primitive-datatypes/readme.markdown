title: Primitive Datatypes
pcaps: 

Primitive Datatypes
===================

Now that we have variables we can talk about which data types we can use and assign to variables.
In this lesson we introduce the simpler types.

Zeek has a static type system (i.e., the type of data a variable holds is
fixed) with type inference, e.g., `local x = 0` is equivalent to
`local x: count = 0`. It also implicitly promotes/coerces types in
certain situations.

The full reference on types in Zeek can be found [here](https://www.zeek.org/sphinx/script-reference/types.html).
For now, look through the simple types. Most of the types should be familiar from other programming languages,
e.g., `bool`, `double`, `int`, `count`, `string`, `pattern` (a regular expression using [flex's syntax](http://flex.sourceforge.net/manual/Patterns.html)).
But Zeek as a network monitoring system introduces also a set of domain-specific types that are explained 
in the [reference](https://www.zeek.org/sphinx/script-reference/types.html).
Examples are `time`, `interval`, `port`, `addr`, and `subnet`.

These custom Zeek types and the more complex types will be discussed in detailed examples in later lessons. 

Run the code in this example. Try to play with the given code example,
e.g. change the given types. Does that work?



