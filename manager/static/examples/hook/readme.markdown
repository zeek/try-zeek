title: hook
pcaps: 
pred: events
succ: composite-types

Hook
=======

Hooks are yet another flavor of function.  They are similar to events
in that they can also have multiple bodies. However they are different
in two regards:

* They do execute immediately when invoked (i.e. they're not scheduled
  like events).
* The way the body of a hook handler terminates determines if further
  handlers get executed.
  If the end of the
  body, or a `return` statement, is reached, the next hook handler
  will be executed.  If, however, a hook handler body terminates with a `break`
  statement, no remaining hook handlers will execute.

Hooks are useful to provide customization points for modules, as they
allow to outsource decisions to site-specific code.

In this example we included the mentioned break statement, so the hook
with priority `-5` is never executed. Try to play with this statement and 
the priorities to change the behavior of this example code.
