title: hook
pcaps: 
pred: events
succ: composite-types

hook
=======

Hooks are yet another flavor of function.  They are similar to events,
but with a few main differences:
* They do execute immediately when invoked (i.e. they're not scheduled
  like events).
* It matters how the body of a hook handler terminates.  If the end of the
  body or a `return` statement is reached, remaining hook handlers
  will be executed.  If a hook handler body terminates due to a `break`
  statement being reached, no remaining hook handlers are executed.

In this example we included the mentioned break statement, so the hook
with priority `-5` is never executed. Try to play with this statement and 
the priorities to change the behavior of this example code.
