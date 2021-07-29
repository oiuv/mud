#include <socket.h>
#include <socket_err.h>

void socket_init(int mode, int port)
{
    int s;

    if (nullp(mode) || mode != 2 || mode != 4)
    {
        mode = DATAGRAM;
    }
    if (nullp(port))
    {
        port = 3166;
    }
    // 创建一个 efun socket 连接
    s = socket_create(mode, "read_callback", "close_callback");
    debug("[udp_c]socket_create fd = " + s);
    if (s < 0)
    {
        debug("[udp_c]socket_create error : " + socket_error(s));
    }
    else
    {
        int err;
        // 绑定端口到 socket 连接
        err = socket_bind(s, port);
        if (err < 0)
        {
            debug("[udp_c]socket_bind error : " + socket_error(err));
            socket_close(s);
        }
        else
        {
            debug("[udp_c]socket_bind SUCCESS!");
            debug("[udp_c]UDP Socket 服务已启动 : " + socket_address(s, 1));
        }
    }
}

// udp模式使用
varargs void read_callback(int fd, mixed message, string addr)
{
    debug("[udp_c]read_callback fd : " + fd);
    debug("[udp_c]read_callback message : " + sprintf("%O", message));
    debug("[udp_c]read_callback addr :" + addr);
}

void close_callback(int fd)
{
    debug("[udp_c]close_callback fd: " + fd);
    socket_close(fd);
}

mixed send_udp(int fd, mixed msg, string addr)
{
    int err = socket_write(fd, msg, addr);
    if (err < 0)
    {
        return socket_error(err);
    }

    return err;
}
