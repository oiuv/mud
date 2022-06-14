#include <socket.h>
#include <socket_err.h>

#define WRITE_WAIT_CALLBACK 0
#define WRITE_GO_AHEAD 1

#define STATE_RESOLVING 0
#define STATE_CONNECTING 1
#define STATE_CLOSED 2
#define STATE_CONNECTED 3

nosave mapping hostname_to_fd;
nosave mapping status;
nosave object receiver;

void create()
{
    hostname_to_fd = ([]);
    status = ([]);
    receiver = this_player();
}

void socket_shutdown(int fd)
{
    status[fd]["status"] = STATE_CLOSED;

    tell_object(receiver, sprintf("%O", status));
}

void receive_data(int fd, mixed result)
{
    tell_object(receiver, sprintf("fd %d received: %O", fd, result));
}

void write_data(int fd)
{
    status[fd]["status"] = STATE_CONNECTED;

    tell_object(receiver, sprintf("%O", status));

    socket_write(fd, "GET " + status[fd]["path"] + " HTTP/1.1\nHost: " + status[fd]["host"] + "\n\r\n\r");
}

void on_resolve(string host, string addr, int key)
{
    int fd;
    int ret;

    tell_object(receiver, sprintf("host = %s | addr = %s | key = %d\n", host, addr, key));

    if (addr)
    {
        fd = hostname_to_fd[host];

        ret = socket_connect(fd, addr + " " + status[fd]["port"], "receive_data", "write_data");
        if (ret != EESUCCESS)
        {
            tell_object(receiver, "unable to connect: " + socket_error(ret) + "\n");
            socket_close(fd);
            return;
        }
        status[fd]["status"] = STATE_CONNECTING;
        tell_object(receiver, sprintf("%O", socket_status(fd)));
    }
}

int get(string host, int port, string path)
{
    int fd;

    fd = socket_create(STREAM, "receive_data", "socket_shutdown");
    status[fd] = ([]);
    status[fd]["status"] = STATE_RESOLVING;
    status[fd]["host"] = host;
    status[fd]["port"] = port;
    status[fd]["path"] = path;

    tell_object(receiver, sprintf("%O", status));
    hostname_to_fd[host] = fd;
    resolve(host, "on_resolve");

    return 0;
}
