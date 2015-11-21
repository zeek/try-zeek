title: Events	
pcaps: 
pred: solution-switch-exercise
succ: hook

Events
===================

We introduced events briefly in the first example to be able to do anything 
with the Bro language. Events are actually a special flavor of functions 
but are essential to how Bro works.
They differ from functions in the following ways:

* They may be scheduled and executed at a later time, so that their
  effects may not be realized directly after they are invoked.
* They return no value -- they can't since they're not called directly
  but rather scheduled for later execution.
* Multiple bodies can be defined for the same event, each one is
  deemed an "event handler", and when it comes time to execute an
  event, all handler bodies for that event are executed in order of
  `&priority`.

In the Bro documentation is a detailed chapter about Bro's event engine, how Bro and the scripts
interact, and what role the `event` plays in a Bro script. Please [read](https://www.bro.org/sphinx-git/scripting/index.html#the-event-queue-and-event-handlers).
The refernce for [events](https://www.bro.org/sphinx/scripts/base/bif/event.bif.bro.html).

* In this example we first see an event declaration of "myevent" that takes the string "s".
* The the event handler implementation follows. The `&priority` attribute is optional and
may be used to influence the order in which event handler bodies execute.
If omitted, &priority is implicitly 0. In the example the priority is `-10` and thus very low. 
When this handler is called it will increment `n` from `0` to `1`.
* The next handler for the same event sets the priority to 10. This handler will print the string "myevent"
and the current values of the variables `s` and `n`.
* Next we see the already fmiliar `bro_init` event that is executed once when Bro starts.

Run the code and follow the order in which the events are executed. The first execution is a 'a soon as possible"
schedule, the `schedule 5 sec {}` executes either in 5 seconds or upon Bro shutting down, whichever 
happens first.


