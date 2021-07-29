#include <socket.h>
#include <socket_err.h>

void socket_init(int mode, int port)
{
    int s;

    if (nullp(mode) || mode == 2 || mode >= 4)
    {
        mode = MUD;
    }
    if (nullp(port))
    {
        port = 3160;
    }

    s = socket_create(mode, "read_callback", "close_callback");
    debug("[tcp_s]socket_create fd = " + s);
    if (s < 0)
    {
        debug("[tcp_s]socket_create error : " + socket_error(s));
    }
    else
    {
        int err;

        // 绑定端口到 socket 连接
        err = socket_bind(s, port);
        if (err < 0)
        {
            debug("[tcp_s]socket_bind error : " + socket_error(err));
            socket_close(s);
        }
        else
        {
            debug("[tcp_s]socket_bind SUCCESS!");
            // 监听一个 socket 连接
            err = socket_listen(s, "listen_callback");
            if (err < 0)
            {
                debug("[tcp_s]socket_listen error : " + socket_error(err));
                socket_close(s);
            }
            else
            {
                debug("[tcp_s]socket_listen ON " + socket_address(s, 1));
            }
        }
    }
}

// tcp模式无用
varargs void read_callback(int fd, mixed message, string addr)
{
    debug("[tcp_s]read_callback fd : " + fd);
    debug("[tcp_s]read_callback message : " + message);
    debug("[tcp_s]read_callback addr :" + addr);
}

void close_callback(int fd)
{
    debug("[tcp_s]close_callback fd: " + fd);
    socket_close(fd);
}

void listen_callback(int fd)
{
    int s, err;
    debug("[tcp_s]listen_callback fd : " + fd);
    // 在一个 socket 上接受连接
    s = socket_accept(fd, "read_callback2", "write_callback");
    debug("[tcp_s]socket_accept fd = " + s);
    if (s < 0)
    {
        debug("[tcp_s]socket_accept error : " + socket_error(s));
    }
    else
    {
        err = socket_write(s, "欢迎连接到服务器 mud.ren ^_^");
        if (err < 0)
        {
            debug("[tcp_s]socket_write error : " + socket_error(err));
        }
    }
}

// 接受消息
varargs void read_callback2(int fd, mixed message)
{
    debug("[tcp_s]read_callback2 fd : " + fd);
    debug("[tcp_s]read_callback2 : " + sprintf("%O", message));
    // 发送消息给客户端
    if (message == "hi")
    {
        socket_write(fd, "你好呀。");
    }
}

void write_callback(int fd)
{
    debug("[tcp_s]write_callback fd : " + fd);
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
