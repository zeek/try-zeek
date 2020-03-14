title: Hello World
pcaps: 

Hello World
============

Welcome to our interactive Zeek tutorial.  (Note that "Zeek" is the
new name of what used to be known as the "Bro" network monitoring system.
The old "Bro" name still frequently appears in the system's documentation
and workings, including in the names of events and the suffix used for
script files.)

Click run and see the Zeek magic happen. You may need to scroll
down a bit to get to the output.

In this simple example you can see already a specialty of Zeek, the "event". Zeek is event-driven.
This means you can control any execution by making it dependent on an event trigger. 
Our example here would not work without an event to be triggered so we use the two events that are always raised,
	zeek_init()
and 
	zeek_done()
 
The first is executed when Zeek is started, the second when Zeek terminates, so we can use these for example
when no traffic is actually analyzed as we do for our basic examples
(see [here](https://docs.zeek.org/en/current/scripts/base/bif/event.bif.bro.html) for more on these basic events).
In this tutorial we will come back to events in the lesson about [complex data types](http://try.zeek.org/example/events).

Other than that, all this script does is sending warm greetings to new Zeek users by printing to STDOUT.

Try.Zeek allows you to hide the text if you want to script console to be full width. Find the button "hide" and give it a try.

Every example can be run with a pcap file, you can select one below the script area. You can also
upload your own pcap-examples. Select a pcap and click run again. Below the print-output you will find tabs
with the familar log-file names. You can click on each row inside a log file and get more details. If Zeek logs are not yet
familiar to you please go to the documentation on [log files](https://docs.zeek.org/en/current/script-reference/log-files.html).

When you are ready you can just click on next below and start the next example.
