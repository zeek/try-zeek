title: The switch statement
pcaps:
pred: solution-script-exercise-1
succ: switch-exercise

Switch Statement
=====================

Sometimes a switch statement is a more convenient way to organize code.
For example, consider a switch instead of large chains of "else if"
blocks if there's a large chain of OR'd conditions.

The syntax is similar to other common languages, "switch - variable - label".
In Bro it is possible to collect two or more label values to execute the same block of code.
Also you can declare a default case if the input value does not match any of the cases.
You must finish each case block with either "break" statement (to
continue after the switch), or an explicit "fallthrough" to proceed
into the subsequent case.

Now click "next" to solve an exercise using a switch.
