title: SumStats Exercise Solution
pcaps: sumstat.pcap

SumStats Exercise Solution
==================================

On the left is the solution to the exercise.
As seen before in this tutorial to raise a notice we need to add a new type of notice. 
Instead of UNIQUE this time we calculate the sum of all requests. 10 is a very low number but serves the
purpose of an exercise. This time we don't use the epoch result but react to a crossed threshold. 
In order to do this we need to evaluate the threshold first, once it is crossed we send out the notice. 
Within this platform we can only write it to the notice.log but in reality it can of course be sent as
an email to warn the security admin about suspicious behavior.

A more advanced sumstats example is the script [scan.bro](https://www.zeek.org/sphinx/_downloads/scan.bro).
This script uses more than one reducer and looks for scanning of ports and IP addresses at the same time.

