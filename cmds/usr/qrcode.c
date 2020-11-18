#include <ansi.h>

#define STREAM 1
#define EESUCCESS 1

nosave mapping status = ([]);
nosave object receiver;

void write_data(int fd)
{
    socket_write(fd, "GET " + status[fd]["path"] + " HTTP/1.0\nHost: " + status[fd]["host"] + "\n\r\n\r");
}

void receive_data(int fd, mixed result)
{
    string qrcode;
    qrcode = result[strsrch(result, "<pre>") + 5..strsrch(result, "</pre>") - 1];
    // debug_message(sprintf("%d || %O", strlen(result), result));
    tell_object(receiver, qrcode);
}

void receive_callback(int fd, mixed result, string addr)
{
    // 此方法无效
}

void socket_shutdown(int fd)
{
    socket_close(fd);
}

int main(object me, string arg)
{
    int fd;
    int ret;
    string host = "qrenco.de";
    string addr = "5.9.243.188 80";
    string path = "/" + arg;

    receiver = me;

    fd = socket_create(STREAM, "receive_callback", "socket_shutdown");
    status[fd] = ([]);
    status[fd]["host"] = host;
    status[fd]["path"] = path;

    ret = socket_connect(fd, addr, "receive_data", "write_data");
    if (ret != EESUCCESS)
    {
        tell_object(receiver, "服务器连接失败。\n");
        socket_close(fd);
    }

    return 1;
}


int help(object me)
{
    write(@HELP
指令格式 : qrcode 内容

这个指令可以用指定内容生成二维码。

HELP );
    return 1;
}
