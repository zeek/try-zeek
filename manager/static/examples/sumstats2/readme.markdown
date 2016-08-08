title: SumStats Exercise Solution
pcaps: exercise_traffic.pcap
pred: sumstats
succ: sumstats3

SumStats Exercise Solution
==============================

On the left is the solution to the exercise. Note that you not only need to change the reducer but also
the field names in the print statement. Try again to print the whole result to see all the options.
Also for this traffic example the probabilistic calculation is too good and you won't see a difference.
You can print out the fields hll\_error\_margin  hll\_confidence to see the error that is made by using 
this option. Both parameters can also be set using the same syntax as for the sample size. 

Next Exercise
-------------

Sumstats becomes especially useful if used with thresholds. Write a sumstats script 
that counts the DNS lookups and writes a notice if a host does more than 10 DNS lookups.
Have a look at the available SumStat 
[functions](https://www.bro.org/sphinx/scripts/base/frameworks/sumstats/main.bro.html?highlight=sumstats#type-SumStats::SumStat)
to find out how to work with thresholds.
