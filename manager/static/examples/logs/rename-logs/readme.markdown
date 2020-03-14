title: Rename Logs
pcaps: exercise_traffic.pcap

Rename Logs
=============

Creating your own Logs is already very useful. Another feature in Zeek allows you to modify existing logging, too.
This feature is called filtering, although it allows more than to simply filter out certain fields.
A stream has one or more filters attached to it (a stream without any filters will not produce any log output). 
When a stream is created, it automatically gets a default filter attached to it. 
This default filter can be removed or replaced, or other filters can be added to the stream. 
This is accomplished by using either the 
[Log::add_filter](https://docs.zeek.org/en/current/scripts/base/frameworks/logging/main.bro.html#id-Log::add_filter) 
or [Log::remove_filter](https://docs.zeek.org/en/current/scripts/base/frameworks/logging/main.bro.html#id-Log::remove_filter) 
function. The default filter writes all fields to the logfile that carry the `&log` attribute.
In this tutorial we will show you how to use filters to do such tasks as rename a log file, 
split the output into multiple files, control which records are written, and set a custom rotation interval.

We start with a very simple case. In the code example we simply replace the default log 
filter with a new filter that specifies a value for the “path” field. We'll come back to the factorial example later.

Step by step:
First the function *get_filter* assoziates the new filter *f* with the logging stream of the
[connection analyzer log strteam](https://docs.zeek.org/en/current/scripts/base/protocols/conn/).
After that the new name `myconn` is set. This new filter has to be added to the logging stream.



