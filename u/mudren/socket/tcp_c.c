#include <socket.h>
#include <socket_err.h>

void socket_init(int mode, string addr)
{
    int s;

    if (nullp(mode) || mode == 2 || mode >= 4)
    {
        mode = MUD;
    }
    if (nullp(addr))
    {
        addr = "127.0.0.1 3160";
    }
    // 创建一个 efun socket 连接
    s = socket_create(mode, "read_callback", "close_callback");
    debug("[tcp_c]socket_create fd = " + s);
    if (s < 0)
    {
        debug("[tcp_c]socket_create error : " + socket_error(s));
    }
    else
    {
        int err;

        // 启动一个 socket 连接
        err = socket_connect(s, addr, "read_callback2", "write_callback");
        if (err < 0)
        {
            debug("[tcp_c]socket_connect error : " + socket_error(err));
            socket_close(s);
        }
        else
        {
            debug("[tcp_c]socket_connect SUCCESS!");
        }
    }
}

// tcp模式无用
varargs void read_callback(int fd, mixed message, string addr)
{
    debug("[tcp_c]read_callback fd : " + fd);
    debug("[tcp_c]read_callback message : " + message);
    debug("[tcp_c]read_callback addr :" + addr);
}

void close_callback(int fd)
{
    debug("[tcp_c]close_callback fd: " + fd);
    socket_close(fd);
}

varargs void read_callback2(int fd, mixed message)
{
    debug("[tcp_c]read_callback2 fd : " + fd);
    debug("[tcp_s]read_callback2 : " + sprintf("%O", message));
}

void write_callback(int fd)
{
    debug("[tcp_c]write_callback fd : " + fd);
}

mixed send_tcp(int fd, mixed msg)
{
    int err = socket_write(fd, msg);
    if (err < 0)
    {
        return socket_error(err);
    }

    return err;
}
