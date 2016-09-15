title: Hello World
pcaps: 

Hello World
============

Welcome to our interactive Bro tutorial.

Click run and see the Bro magic happen. You may need to scroll
down a bit to get to the output.

In this simple example you can see already a specialty of Bro, the "event". Bro is event-driven.
This means you can control any execution by making it dependent on an event trigger. 
Our example here would not work without an event to be triggered so we use the two events that are always raised,
	bro_init()
and 
	bro_done()
 
The first is executed when Bro is started, the second when Bro terminates, so we can use these for example
when no traffic is actually analyzed as we do for our basic examples
(see [here](https://www.bro.org/sphinx/scripts/base/bif/event.bif.bro.html) for more on these basic events).
In this tutorial we will come back to events in the lesson about [complex data types](http://try.bro.org/example/events).

Other than that, all this script does is sending warm greetings to new Bro users by printing to STDOUT.

Try.bro allows you to hide the text if you want to script console to be full width. Find the button "hide" and give it a try.

Every example can be run with a pcap file, you can select one below the script area. You can also
upload your own pcap-examples. Select a pcap and click run again. Below the print-output you will find tabs
with the familar log-file names. You can click on each row inside a log file and get more details. If Bro logs are not yet
familiar to you please go to the documentation on [log files](https://www.bro.org/sphinx/script-reference/log-files.html).

When you are ready you can just click on next below and start the next example.
