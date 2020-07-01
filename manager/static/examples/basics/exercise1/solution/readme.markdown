title: Exercise 1: Solution
pcaps:

Exercise 1 Solution
=====================================

Here is the solution for the first exercise.

In the zeek\_init event we have a simple for-loop that iterates over
the string "testing". Every character is tested if it is not an "e".
Every other character is added to the end of the string in the variable "result".
The resulting string is the printed and should contain no more "e"s.

The second example shows recursive usage of a function.
The recursion counts to 100 and replaces every 3rd number by "Fizz", every
fifth by "Buzz". To do this the modulo operation is used.
