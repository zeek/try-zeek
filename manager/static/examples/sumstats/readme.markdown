title: The Summary Statistics Framework
pcaps: exercise_traffic.pcap
pred: new-notice 
succ: sumstats2

The Summary Statistics Framework
==================================

The Summary Statistics framework (short sumstats) is a very useful tool to get a deep understanding
about what 
is going on in your network. A good example is the scan-detector that correlates many short, 
maybe even failed connections that seem unrelated, together and gives a warning about
a scanner activity. To many users this framework appears difficult to use. This tutorial 
is meant to change that.

Alongside this tutorial you can read the 
[documentation](https://www.bro.org/sphinx/frameworks/sumstats.html) 
explaining the terminology used for the Sumstats framework. This tutorial follows (in parts)
the live tutorial Seth Hall gave at BroCon 2014, which is available as Youtube 
[video](https://youtu.be/9YsenekNaSI)


Run the code to the left and have a look on the output. Now lets go through the code.

First sumstats needs something to count, i.e. a Bro event. For this example we chose the event 
"dns\_request", we will count unique DNS requests, that is unique requests per host. 
The "if" line is there to ensure real DNS requests (via port 53) that are also not empty.
This specific case would quickly kill the memory of your Bro system, because it collects
every unique DNS request for every host it can see, so one option would be to limit this to port
53, non-empty requests and only local hosts. 
If it is a real request we want to observe something, that is where the sumstats observer is used. 
The string dns.lookup is an arbitrary name, it could be something else. The principle is that a stream
of information is observed (counted), the stream gets a name to later be addressed by.
The next part is the key, in this case the host which sends the request. To know the actual unique request
also the query string needs to be part of the key.

Now there is a stream that is observed, the next step is to reduce (i.e. summarize) the stream and then do 
something with it. The reducer  gets a variable name, r1 in this case, is attached to the stream named
dns.lookup and also needs at least one reducing function that is applied on the stream.
In this example the method used is "UNIQUE".
More than one calculation method can be applied, they are all listed in the 
[sumstats reference](https://www.bro.org/sphinx/scripts/base/frameworks/sumstats/main.bro.html#type-SumStats::Calculation).
There can also be more than one reducer, an example for this is explained in the documentation for
[MIME type statistics](https://www.bro.org/sphinx/mimestats/index.html).

The third step is to link the reducer to a SumStats to finally do something with it.
The SumStats also gets a name to reference later. An epoch is assigned, in this case 6 hours. 
After 6 hours or the end of the trace it will come back with the results. 
The reducer (or set of reducers) is attached. 
The call back function is epoch result which is the key given in the observer before, 
and it will give you the result. 
Now you can access the results for the stream named dns.lookup. In this case we print the host, 
the total number of DNS requests and the number of unique requests.

Comment out the two lines within the epoch\_result and directly print result. You can see
all fields available to print out.

Exercise: Use the heuristic version of the unique calculation, HLL\_UNIQUE, you find it 
in the [documentation](https://www.bro.org/sphinx/scripts/base/frameworks/sumstats/main.bro.html#type-SumStats::Calculation). Then take a sample of size 5. For the solution go to the next page.
