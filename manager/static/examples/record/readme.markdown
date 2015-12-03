title: record
pcaps: 
pred: vector
succ: redefinitions

Record
=======

A `record` is a user-defined collection of named values of
heterogeneous types, similar to a struct in C.  Fields are dereferenced via the `$` operator
(`.`, as used in other languages, would be ambiguous in Bro because of
IPv4 address literals).  Optional field existence is checked via the
`?$` operator.


