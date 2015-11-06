event bro_init() { 
     print /one|two|three/ == "two";  # T
     print /one|two|three/ == "ones"; # F (exact matching)
     print /one|two|three/ in "ones"; # T (embedded matching)
     print /[123].*/ == "2 two";  # T
     print /[123].*/ == "4 four"; # F
 
}

