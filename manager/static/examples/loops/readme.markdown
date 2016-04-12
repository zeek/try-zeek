title: Loops
pcaps:
pred: operators
succ: while

Loops: For
================

Bro uses a "foreach" style loop.
In the given example we simply iterate through the string "abc"
and print the current character.

Note: Iterating over any collection other than a vector won't provide any guarantee of the order
Bro iterates over the collection. If the order is important the collection should be a vector.
