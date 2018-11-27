title: Exercise 2
pcaps: exercise_traffic.pcap

Exercise: Solution
==========================

The solution is one possible way to solve this exercise.

* First we write local subnets into a set.
* To count all connections we declare the global counter my\_count.
* To learn about every new connection we simply use the event [new\_connection](https://www.zeek.org/sphinx/scripts/base/bif/event.bif.bro.html#id-new_connection). 
  Every time this
  event is triggered we increase the counter. For the first 10 connections we print source IP and port and 
  destination IP and port, plus connection ID and time. To get the connection ID we need the filed uid of the connection.
  To print the start time of the connection in human readable form we use the Zeek bif [strftime](https://www.zeek.org/sphinx/scripts/base/bif/bro.bif.bro.html?highlight=strftime#id-strftime).
* The duration of a connection - expressed as an interval - can be retrieved when the connection ends. 
  The event [connection\_state\_remove](https://www.zeek.org/sphinx/scripts/base/bif/event.bif.bro.html?highlight=connection_state_remove#id-connection_state_remove)
  is triggered when a connection is about to be removed from memory. Then we can simply ask for the duration.
* At the very end inside the bro\_done event we compute the rest. Print the number of connections stored in my\_count
  and use a for-loop to print out a list of all unique IPs and if they are local or external IPs.
  In this example we simply define which subnets are considered local. This does not mean that the list is complete. In a real
  world example this should be verified and documented in [networks.cfg](https://www.zeek.org/sphinx/components/broctl/README.html).


