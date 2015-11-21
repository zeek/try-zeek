title: record
pcaps: 
pred: vector
succ: redefinitions

Record
=======

A `record` is a user-defined collection of named values of
heterogeneous types.  Fields are dereferenced via the `$` operator
(`.`, as used in other languages is ambiguous in Bro because of
IPv4 address literals).  Optional field existence is checked via the
`?$` operator.


