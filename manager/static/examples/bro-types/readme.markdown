title: Bro Datatypes
pcaps: 
pred: redefinitions 
succ: script-exercise-2

Bro Datatypes
===================

As a network monitoring system Bro has its focus on networks and includes some data types 
specifically helpful when working with networks.

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
 

