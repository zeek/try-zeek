event bro_init() { 
	local x: table[count] of string = { [1] = "one", [3] = "three",
                                            [5] = "five" };
        x[7] = "seven";
        print 7 in x; # T
        print x[7]; # seven
        delete x[3];
        print 3 !in x; # T
        x[1] = "1"; # changed the value at index 1
        for ( key in x ) print key;
}

