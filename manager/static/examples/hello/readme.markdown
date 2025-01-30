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
(see [here](https://docs.zeek.org/en/current/scripts/base/bif/event.bif.zeek.html) for more on these basic events).
In this tutorial we will come back to events in the lesson about [complex data types](http://try.zeek.org/example/events).

Other than that, all this script does is sending warm greetings to new Zeek users by printing to STDOUT.

Try.Zeek allows you to hide the text if you want to script console to be full width. Find the button "Hide Text" and give it a try.

Every example can be run with a pcap file, you can select one below the script area. You can also
upload your own pcap-examples. Select a pcap and click run again. Below the print-output you will find tabs
with the familar log-file names. You can click on each row inside a log file and get more details. If Zeek logs are not yet
familiar to you please go to the documentation on [log files](https://docs.zeek.org/en/current/script-reference/log-files.html).

When you are ready you can just click on next above to start the next example, or jump directly to a topic in the following list

Basics
======
 * [Loading Scripts](#/?example=basics-loading)
 * [Functions](#/?example=basics-functions)
 * [Variables](#/?example=basics-variables)
 * [Primitive Datatypes](#/?example=basics-primitive-datatypes)
 * [Operators](#/?example=basics-operators)
 * [If](#/?example=basics-control-flow-if)
 * [For Loops](#/?example=basics-loops-for)
 * [Loops: While](#/?example=basics-loops-while)
 * [Exercise](#/?example=basics-exercise1-exercise)
 * [Exercise 1: Solution](#/?example=basics-exercise1-solution)
 * [The switch statement](#/?example=basics-switches-switch)
 * [Switch Exercise](#/?example=basics-switches-switch-exercise)
 * [Switch Exercise: Solution](#/?example=basics-switches-solution-switch-exercise)
 * [Event](#/?example=basics-event)
 * [hook](#/?example=basics-hook)
 * [Set](#/?example=basics-composite-types-set)
 * [Table](#/?example=basics-composite-types-table)
 * [Vector](#/?example=basics-composite-types-vector)
 * [record](#/?example=basics-composite-types-record)
 * [Redefinitions](#/?example=basics-redefinitions-redef-records)
 * [Zeek Datatypes](#/?example=basics-bro-types)
 * [Exercise](#/?example=basics-exercise2-script-exercise-2)
 * [Exercise 2](#/?example=basics-exercise2-solution-script-exercise-2)

Modules
=======
 * [Writing a Module](#/?example=modules-module)
 * [Writing a Module: Export](#/?example=modules-export)
 * [Writing a Module: Logging](#/?example=modules-log-factorial)

Logs
====
 * [Filtering Logs](#/?example=logs-filter-logs)
 * [Rename Logs](#/?example=logs-rename-logs)
 * [Raising a Notice](#/?example=new-notice)

Sumstats
========
 * [The Summary Statistics Framework](#/?example=sumstats-sumstats1)
 * [SumStats Exercise Solution Part 1](#/?example=sumstats-sumstats2)
 * [SumStats Exercise Solution Part 2](#/?example=sumstats-sumstats3)

Intel Framework
===============
 * [Intel](#/?example=intel-intel-1)
