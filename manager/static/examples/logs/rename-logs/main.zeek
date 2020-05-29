event zeek_init()
    {
    # Replace default filter for the Conn::LOG stream in order to
    # change the log filename.

    local f = Log::get_filter(Conn::LOG, "default");
    f$path = "myconn";
    Log::add_filter(Conn::LOG, f);
    }
