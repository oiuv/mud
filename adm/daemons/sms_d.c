/**
 * @file sms_d.c 短信验证码守护进程
 * @author 雪风@mud.ren
 * @brief https://apis.baidu.com/store/detail/b1a3e224-2faa-462c-9075-8a42fc1e9e16
 * @version 1.0
 *
 * @copyright Copyright (c) 2021 mud.ren
 *
 */
#include <ansi.h>

#define STREAM 1
#define EESUCCESS 1

nosave string host = "gwgp-wtxhytukujk.n.bdcloudapi.com";
nosave string addr = "153.37.235.160 80";
nosave string path = "/chuangxin/dxjk";
nosave string AppCode = env("AppCode");
nosave mapping status = ([]);
nosave object receiver;

protected void write_data(int fd)
{
    socket_write(fd, status[fd]["http"]);
}

protected void receive_data(int fd, mixed result)
{
    int n = strsrch(result, "{");

    if (n > 0)
    {
        result = json_decode(trim(result[n..]));
        // debug_message(sprintf("%O", result));
        if (result["ReturnStatus"] == "Success")
        {
            tell_object(receiver, BCYN "验证码发送成功，请注意查收短信。\n" NOR);
        }
        else
        {
            tell_object(receiver, BRED + result["Message"] + NOR "\n");
        }
    }

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

// 发送短信
void sms(object me, mixed code, mixed mobile)
{
    int fd;
    int ret;
    string tpl = "【雪风】你的验证码是：" + code + "，请勿泄漏于他人！";
    string arg = "?content=" + tpl + "&mobile=" + mobile;

    receiver = me;

    if (!AppCode)
    {
        error("请先配置短信API AppCode！");
    }

    fd = socket_create(STREAM, "receive_callback", "socket_shutdown");
    status[fd] = ([]);
    status[fd]["http"] = "GET " + path + arg + " HTTP/1.1\nHost: " + host + "\nContent-Type: application/json;charset=UTF-8\nX-Bce-Signature: AppCode/" + AppCode + "\r\n\r\n";

    ret = socket_connect(fd, addr, "receive_data", "write_data");
    if (ret != EESUCCESS)
    {
        tell_object(receiver, "服务器连接失败。\n");
        socket_close(fd);
    }
    else
    {
        // 记录日志
        log_file("mobile", "[" + ctime() + "]" + mobile + "\t" + me->short() + "\t" + query_ip_number(me) + "\n");
    }
}
