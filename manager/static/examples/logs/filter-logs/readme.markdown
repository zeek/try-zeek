title: Filtering Logs
pcaps:  
pred: rename-logs
succ: new-notice

Filtering Logs
=========================

As said in the last lesson, filtering allows to manipulate Zeek's logging in several ways. Renaming the log-file is one.
Splitting the stream into two log files is the one we explore in this lesson.

For this we go back to the factorial module. The goal now is to split the logging stream in two. We send all results to 
one log-file that are divisible evenly by 5, the others to a second log-file. 
Which record is sent to which log-file is decided dynamically based on the 
modulo function. Find more details on dynamically determining log paths 
[here](https://docs.zeek.org/en/current/frameworks/logging.html#determine-log-path-dynamically).

Now run the code example. You see that there are now two log-files, one called `num` and `factorial_num`.
Lets look at the code. In the module *factorial.zeek* we add a new function, the `path_func` we
are going to use. Again, the function is also added to the export section. The function returns whether a number is in
our modulo-5 category or not and then returns a string accordingly. The strings returned are the names of the two new log files. 
In *main.zeek* you will find that we added more lines to `zeek_init`. We create a
filter called *split-mod5s*, add that new filter and remove the `default` filter.
Comment out the line 9 that removes the dafault and see what happens.

