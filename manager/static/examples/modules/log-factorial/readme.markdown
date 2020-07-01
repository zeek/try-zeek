title: Writing a Module: Logging
pcaps: 

Writing a Module: Logging
=========================

Often a new module creates new data that you may want to collect in a new log file, too.
Manipulating Logs in Zeek is a useful tool and is more than just adding more log-files or fields.
We use the case of the factorial module to introduce you to the [logging framework](https://docs.zeek.org/en/current/frameworks/logging.html)

Again, we first look into factorial.zeek.
In the export section you find a new line that uses `redef` to add a new value named `LOG`
to the `Log::ID` enumerable. This enumerable is part of Zeek's logging framework. You can find details
[here](https://docs.zeek.org/en/current/scripts/base/frameworks/logging/main.zeek.html).

The next step is to create a record that contains the columns of the future log file. The record
is named `Info`. We create two columns named `num` and `factorial_num`. `num` is there to list the current value
of `n`, `factorial_num` logs the factorial of `n`. Both variables have the attribute `&log` which
tells Zeek that a field of the given name has to be added to the logging stream.

During this tutorial you have already seen some attributes. Attributes are used to add certain properties to functions and
variables. For example the `&redef` attribute allows to redefine a global constant or extend a type. `&optional` allows a 
value in a record field to be missing. The list of all attributes is found [here](https://docs.zeek.org/en/current/script-reference/attributes.html?highlight=attributes).

Now please switch to the file main.zeek. At the beginning of our script we need to create the new logging
stream. [Log::create\_stream](https://docs.zeek.org/en/current/scripts/base/frameworks/logging/main.zeek.html?highlight=log%3A%3Acreate_stream#id-Log::create_stream) does exactly this. 
The necessary parameters are of course the module's `LOG` value, and the record that holds the logging fields. 
The variable `$path` tells Zeek how it should name the new log-file. Note that the Log stream needs to be initialized within the zeek\_init event.

The next step looks very similar to the one before, but instead of printing the results to Stdout we now 
write to the new log, using the [Log::write](https://docs.zeek.org/en/current/scripts/base/frameworks/logging/main.zeek.html?highlight=log%3A%3Awrite#id-Log::write) function.

One more note on writing to logs: In this example we wrote all results within zeek\_done, in a real world example this
is usually done inside an event handler that has to do with the log-file.



