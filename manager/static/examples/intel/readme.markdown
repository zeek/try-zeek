title: Intel
pcaps: http.pcap
pred: sumstats3
succ: congrats

The Intel Framework
====================

The Intel Framework provides an interface to feed your own intelligence data into Bro.

"Intelligence data is critical to the process of monitoring for security purposes. There is always data which will be discovered through the incident response process and data which is shared through private communities. The goals of Bro’s Intelligence Framework are to consume that data, make it available for matching, and provide infrastructure around improving performance, memory utilization, and generally making all of this easier." 

Find the whole documentation on the Intelligence Framework on 
our [website](https://www.bro.org/sphinx/frameworks/intel.html). 
You will also find details on input formats etc.

Run the example given. Have a look at the extra file "intel-1.dat".
This the source intel data that you feed into Bro. 

As you can see the script to read an intel data files and make Bro notify you if
it sees a match is very simple at the start.
The "seen"-policy need to be loaded. This would in a real setup be done in the local.bro file.
The second step is to tell Bro where to find the file and the name of it. 

Please have a look at the results. You can notice a new log-file called intel.log which contains
all seen matches. As always the uid allows you to investigate further which connections were involved in this match and in what way.

It is also possible to raise notices based on intel data. To see how this works have a look at the 
documentation mentioned above.





This is about intel. and stuff.

