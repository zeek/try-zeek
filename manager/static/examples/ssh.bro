global ssh_connections: count = 0;
global ssh_connections_by_host: table[addr] of count &default=0;

event SSH::log_ssh(rec: SSH::Info) {
    ++ssh_connections;
    ++ssh_connections_by_host[rec$id$orig_h];
}

event bro_done() {
    print fmt("Saw %d ssh connections", ssh_connections);
    for (src in ssh_connections_by_host) {
        print fmt("%s made %d connections", src, ssh_connections_by_host[src]);
    }
}
