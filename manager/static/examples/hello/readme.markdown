title: Hello World
pcaps: 
pred:
succ: loading

Hello
=======

Welcome to our interactive Bro tutorial.

Now click run and see the Bro magic happen. You may need to scroll
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

When you are ready you can just click on next below and start the next example.
