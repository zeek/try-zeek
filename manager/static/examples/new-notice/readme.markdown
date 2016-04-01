title: Raising a Notice
pcaps: 
pred: filter-logs 
succ: 

Raising a Notice
=====================

One of the easiest ways to customize Bro is writing a local notice policy.
Apart from looking into log files you can ask Bro to send you emails, either for a 
certain situation or aggregated summary emails about warnings etc.
This feature is given through the [Notice Framework](https://www.bro.org/sphinx/frameworks/notice.html).

In this lesson we start by creating a new notice. In Try.Bro the notice can only be made into a log file.
It can't send an email. Please run the code example and have a look at the new log-file.
Apart from the message itself it tells you the name of the notice. This is especially useful for aggregated summaries.

Lets have a look on the code. Start with factorial.bro. We append a new notice type value in the export section.
For this example we asy that *120* is an interesting value we want to be notified about. So we make it a constant that
can be changed to something else later.
Now the Factor moudle can be asked to rais a notice.

In main.bro every time the factorial is computed we ask if it is an interesting result.
If so, the notice is raised. The fields `msg` and `sub` are given. You can put any text there that will later help you
to find out what you need. The Notice Framework can be a little confusing. It is easier to handle if you
remind yourself that it is simply a function.

Sending emails through the Notice Frameworks requires a working sendmail config on your system. This lesson should give you a start with this topic. Please go ahead and try it out within your local Bro installation.

