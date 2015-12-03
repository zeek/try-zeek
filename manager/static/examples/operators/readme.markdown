title: Operators
pcaps:
pred: primitive\_datatypes
succ: loops 

Operators
==========

So far we have functions, variables, and we can even type them. 
We still can't connect two (or more) values to build a new one. 
So now we can talk about operators that are used to manipulate, inspect, or compare data.

Explore the operators below to play with the Bro elements we have so
far. In the next two steps, we introduce loops 
and if-statements so that we can solve more complex exercises.

Arithmetic Operators
-----------------------

 Name          | Syntax    | Example Usage
 ------------- | --------- | --------------------------------------------------
Addition       | ``a + b`` | ``print 2 + 2;   # 4``
Subtraction    | ``a - b`` | ``print 2 - 2;   # 0``
Multiplication | ``a * b`` | ``print 4 * 4;   # 16``
Division       | ``a / b`` | ``print 15 / 3;  # 5``
Modulo         | ``a % b`` | ``print 18 % 15; # 3``
Unary Plus     | ``+a``    | ``local a = +1;  # Force use of a signed integer``
Unary Minus    | ``-a``    | ``local a = 5; print -a; # -5``
Increment      | ``++a``   | ``local a = 1; print ++a, a; # 2, 2``
Decrement      | ``--a``   | ``local a = 2; print --a, a; # 1, 1``

Assignment Operators
--------------------

Name                   | Syntax     |  Example Usage
-----------------------| ---------- | ------------------------ 
Assignment             | ``a = b``  |  ``local a = 7;``
Addition assignment    | ``a += b`` |  ``local a = 7; a += 2; # 9``
Subtraction assignment | ``a -= b`` |  ``local a = 7; a -= 2; # 5``

Relational Operators
---------------------

 Name            | Syntax     | Example Usage
 --------------- | ---------- | ----------------------
Equality         | ``a == b`` | ``print 2 == 2; # T``
Inequality       | ``a != b`` | ``print 2 != 2; # F``
Less             | ``a < b``  | ``print 2 < 3;  # T``
Less or Equal    | ``a <= b`` | ``print 2 <= 2; # T``
Greater          | ``a > b``  | ``print 2 > 3;  # F``
Greater or Equal | ``a >= b`` | ``print 2 >= 2; # T``

Logical Operators
------------------

Name             | Syntax     | Example Usage
---------------- | ---------- | ----------------------
Logical NOT      | ``! a``    | ``print !T;     # F``
Logical AND      | ``a && b`` | ``print T && F; # F``
Logical OR       | ``a || b`` | ``print F || T; # T``

Other Operators
----------------

Name             | Syntax                    | Example Usage
---------------- | ------------------------  | -----------------------------
Member Inclusion | ``a in b``                | ``print "z" in "test";  # F``
Member Exclusion | ``a !in b``               | ``print "z" !in "test"; # T``
Size/Length      | ``|a|``                   | ``print |"test"|;       # 4``
Absolute Value   | ``|a|``                   | ``print |-5|;           # 5``
Index            | ``a[i]``                  | ``print "test"[2];      # s``
String Slicing   | ``a[i:j], a[i:], a[:j]``  | ``print "testing"[2:4]; # st``

