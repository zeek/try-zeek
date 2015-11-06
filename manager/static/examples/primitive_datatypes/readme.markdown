title: Primitive Datatypes
pcaps: exercise_traffic.pcap
pred: variables
succ: operators 

Primitive Datatypes
===================

Now that we have variables we can talk about which data types we can use and assign to variables.
In this chapter we will introduce the simpler types.

Bro has a static type system (the type of data a variable holds is
fixed) with type inference, e.g., `local x = 0` is equivalent to
`local x: count = 0` and implicit type promotion/coercion - limited
to numeric types or records with optional/default fields.

* `bool` - a value that's either true (`T`) or false (`F`).
* `double` - a double-precision floating-point value.
* `int` - a signed 64-bit integer.  May be automatically promoted to
  a `double` when needed.
* `count` - an unsigned 64-bit integer.  May be automatically promoted
  to an `int` or `double` when needed.

* `time` - an absolute point in time (note the only way to create an
  arbitrary time value is via the `double_to_time(d)`, with `d`
  being a variable of type `double`).
* `interval` - a relative unit of time. Known units are `usec`,
  `msec`, `sec`, `min`, `hr`, or `day` (any may be pluralized by
  adding "s" to the end).  Examples: `3secs`, `-1min`.

* `port` - a transport-level port number.  Examples: `80/tcp`,
  `53/udp`.
* `addr` - an IP address.  Examples: `1.2.3.4`, `[2001:db8::1]`.
* `subnet` - a set of IP addresses with a common prefix.  Example:
  `192.168.0.0/16`.  Note that the `/` operator used on an address as
  the left operand produces a subnet mask of bit-width equal to the value
  of the right operand.

* `enum` - a user-defined type specifying a set of related values.
      type Color: enum { Red, Green, Blue, };
* `string` - character-string values.
* `pattern` - a regular expression using [flex's syntax](http://flex.sourceforge.net/manual/Patterns.html).

Run the code in this example. Read the reference on [types](https://www.bro.org/sphinx/script-reference/types.html) 
and try to play with the given code example. Change the types, for example.



