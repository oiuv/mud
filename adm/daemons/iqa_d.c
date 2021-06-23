/**
 * @file iqa_d.c 智能应答机器人
 * @author 雪风@mud.ren
 * @brief https://apis.baidu.com/store/detail/eef864e1-6f2e-4631-befc-5afe35cab769
 * @version 1.0
 * @date 2021-06-13
 *
 * @copyright Copyright (c) 2021 mud.ren
 *
 */
#include <ansi.h>

#define STREAM 1
#define EESUCCESS 1

nosave string host = "jisuapiareacode.api.bdymkt.com";
nosave string addr = "157.255.71.211 80";
nosave string path = "/iqa/query?question=";
// 以下code请自己申请https://apis.baidu.com/store/detail/eef864e1-6f2e-4631-befc-5afe35cab769
nosave string code = "你的AppCode";
nosave mapping status = ([]);
nosave object receiver;

protected void write_data(int fd)
{
    socket_write(fd, status[fd]["http"]);
}

protected void receive_data(int fd, mixed result)
{
    string res;
    // debug_message(result);
    res = trim(result[strsrch(result, "content") + 10 .. strsrch(result, "relquestion") - 4]);
    // debug_message(result);
    // 清理转义字符
    res = replace_string(res, "\\r", "\r");
    res = replace_string(res, "\\n", "\n");
    res = replace_string(res, "\\t", "\t");;
    res = replace_string(res, "\\/s", "");
    res = replace_string(res, "\\", "");
    // 替换默认回复
    res = replace_string(res, "defaultReply", "...");
    if (sizeof(res) < 3)
    {
        return;
    }
    CHANNEL_D->do_channel(receiver, "chat", res);
    // 释放连接
    socket_close(fd);
}

protected void receive_callback(int fd, mixed result, string addr)
{
}

protected void socket_shutdown(int fd)
{
    socket_close(fd);
}

// 智能问答
void iqa(object me, string arg)
{
    int fd;
    int ret;

    receiver = me;

    fd = socket_create(STREAM, "receive_callback", "socket_shutdown");
    status[fd] = ([]);
    status[fd]["http"] = "POST " + path + arg + " HTTP/1.1\nHost: " + host + "\nContent-Type: application/json;charset=UTF-8\nX-Bce-Signature: AppCode/" + code + "\r\n\r\n";

    ret = socket_connect(fd, addr, "receive_data", "write_data");
    if (ret != EESUCCESS)
    {
        tell_object(receiver, "服务器连接失败。\n");
        socket_close(fd);
    }
}
