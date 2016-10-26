@load factorial

event bro_done()
    {
    local numbers: vector of count = vector(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);    
    for ( n in numbers )
    	print fmt("%d", Factor::factorial(numbers[n]));
    }
