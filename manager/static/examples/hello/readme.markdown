title: Hello World
pcaps: 
pred:
succ: namespaces

Hello
=======

Welcome to our interactive Bro tutorial.

This tutorial is divided into different topics covering aspects and use cases of Bro. 
You can navigate through the exercises by clicking next or back on the bottom of each page. 
Every lesson comes with a small code ezample that you can play with and there are some exercises, too.
Each exercise is followed by a solution with an explanation.

Try Bro is interactive, you can always click the Run button and view the result in Stdout and the genrated log files below.
Most of the topics in the first cvhapter don't require a traffic sample, so you can concentrate on learning Bro first.

The different example scripts demonstrate different aspects of Bro. They are meant as a starting point for your
journey learning Bro. You can edit each example and run it again.

Some training examples come with one or more traffic samples in pcap format which the script is run on. 
To make things faster you can select no pcap file. The button "choose file" allows you to upload your own
traffic sample.

In this tutorial we assume that you already "speak" another programming or scripting language and
are familiar with basic terminology, e.g., what a variable is.

Now click run and see the Bro magic happen. 

In this simple example you can see already the specialty in Bro, the "event". Bro is event driven.
This means you can control any execution by making it dependant on an event trigger. 
Our example here would not work without an event to be triggered so we use the two events that are always raised,
	bro_init()
and 
	bro_done()
 
The first is executed when Bro is started, the second when bro terminates, so we can use these for example
when no traffic is actually analyzed as we do for our basic examples.
More on the basic [events](https://www.bro.org/sphinx/scripts/base/bif/event.bif.bro.html).
In this tutorial we will come back to events in the chapter about [complex datatypes](http://try.bro.org/example/events).

Other than that all this script does is sending warm greetings to new Bro users by printing to STDOUT.

When you are ready you can just click on next below and start the next example.
