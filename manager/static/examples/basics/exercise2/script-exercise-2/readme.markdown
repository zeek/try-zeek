title: Exercise
pcaps: exercise\_traffic.pcap
order:

Exercise
==========================

By now we have all basic concepts of the Zeek scripting language.
To finish the first part of your journey into the Zeek language solve the following exercise.

Consider the following list of subnets as your given local subnets:

192.168.1.0/24, 192.68.2.0/24, 172.16.0.0/20, 172.16.16.0/20, 172.16.32.0/20, 172.16.48.0/20.

Write a script that:

* tells for the first 10  new connections source IP and port, destinations IP and port, connection ID, time when the connection started.
* counts all connections seen and prints them in the end.
* prints out for each unique IP address if its is local or external.

To solve this exercise please load the traffic sample exercise_traffic.pcap.
