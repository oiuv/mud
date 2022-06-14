/*
 * @Author: 雪风@mud.ren
 * @Date: 2022-05-11 11:42:27
 * @LastEditTime: 2022-05-18 13:55:32
 * @LastEditors: 雪风
 * @Description: HTTP客户端
 *  https://bbs.mud.ren
 */

#include <socket.h>
#include <socket_err.h>

#define STATE_CONNECTING 0
#define STATE_OPEN 1
#define STATE_CONNECTED 2
#define STATE_CLOSED 3

nosave mapping Host;
nosave mapping Host_fd;
nosave mapping Status;
nosave int Debug;

// 初始化
void create()
{
    Host = ([]);
    Host_fd = ([]);
    Status = ([]);
}

protected void receive_callback(mixed *data...)
{
    Debug && debug_message(sprintf("receive_callback: %O", data));
}

protected void socket_shutdown(int fd)
{
    Status[fd]["status"] = STATE_CLOSED;
    socket_close(fd);
}

// 客户端响应，请重写此接口处理响应
protected void response(mixed result)
{
    // mixed *status = allocate(3);

    // sscanf(result, "%s %d %s\r\n", status[0], status[1], status[2]);

    debug_message(result);
}

protected void write_data(int fd)
{
    Status[fd]["status"] = STATE_CONNECTED;
    Debug && debug_message("write_data: " + Status[fd]["http"]);
    socket_write(fd, Status[fd]["http"]);
}

protected void receive_data(int fd, mixed result)
{
    response(result);

    if (!stringp(Status[fd]["header"]["Connection"]) || lower_case(Status[fd]["header"]["Connection"]) == "close")
    {
        // 释放连接
        socket_shutdown(fd);
    }
}

protected void connect(string host, string addr)
{
    int fd;
    int ret;

    fd = Host_fd[host];
    ret = socket_connect(fd, addr + " " + Status[fd]["port"], "receive_data", "write_data");
    if (ret != EESUCCESS)
    {
        Debug && debug_message("socket_error : " + socket_error(ret));
        socket_shutdown(fd);
        return;
    }

    Status[fd]["status"] = STATE_OPEN;
    Debug && debug_message(sprintf("socket_status : %O", socket_status(fd)));
}

protected void on_resolve(string host, string addr, int key)
{

    Debug && debug_message(sprintf("%s: %s %d", host, addr, key));

    if (addr)
    {
        Host[host] = addr;
        connect(host, addr);
    }
}

nomask protected object request(string method, string url, mixed data, mapping header)
{
    int fd;
    string host, path;
    int port;
    mixed key, value;
    string params, headers, body = "";

    if (!(sscanf(url, "http://%s:%d%s", host, port, path) == 3 ||
          sscanf(url, "http://%s/%s", host, path) == 2 ||
          sscanf(url, "http://%s", host)))
    {
        error("url格式或协议不正确");
        return 0;
    }

    if (!port)
        port = 80;
    if (!path)
        path = "/";
    else if (path[0] != '/')
        path = "/" + path;

    if (mapp(header))
    {
        foreach (key, value in header)
        {
            headers = (headers ? headers + "\r\n" : "\r\n") + key + ": " + value;
        }
    }
    else
    {
        headers = "";
    }

    if (method == "GET" && mapp(data))
    {
        foreach (key, value in data)
        {
            params = (params ? params + "&" : "") + key + "=" + value;
        }
        path += "?" + params;
    }

    if (method == "POST")
    {
        if (mapp(data) && sizeof(data))
        {
            foreach (key, value in data)
            {
                params = (params ? params + "," : "") + key + ":" + value;
            }
            body = "{" + params + "}";
        }
        else if (stringp(data))
        {
            body = data;
        }

        headers += "\r\nContent-Length: " + sizeof(string_encode(body, "utf-8"));
    }

    fd = socket_create(STREAM, "receive_callback", "socket_shutdown");
    Host_fd[host] = fd;
    Status[fd] = ([]);
    Status[fd]["status"] = STATE_CONNECTING;
    Status[fd]["host"] = host;
    Status[fd]["port"] = port;
    Status[fd]["path"] = path;
    Status[fd]["http"] = method + " " + path + " HTTP/1.1\r\nHost: " + host + (port == 80 ? "" : ":" + port) + headers + "\r\n\r\n" + body;
    Status[fd]["header"] = header || ([]);

    Debug && debug_message(sprintf("Status : %O", Status));

    if (Host[host])
    {
        connect(host, Host[host]);
    }
    else
    {
        resolve(host, "on_resolve");
    }

    return this_object();
}

varargs object get(string url, mapping query, mapping header)
{
    if (!url)
    {
        error("Miss 'url' argument to 'get'.");
        return 0;
    }

    return request("GET", url, query, header);
}

varargs object post(string url, mixed body, mapping header)
{
    if (!url)
    {
        error("Miss 'url' argument to 'post'.");
        return 0;
    }

    return request("POST", url, body, header);
}

varargs object head(string url, mapping query, mapping header)
{
    if (!url)
    {
        error("Miss 'url' argument to 'head'.");
        return 0;
    }

    return request("HEAD", url, query, header);
}

varargs object ws(string url, mapping query, mapping header)
{
    if (!url)
    {
        error("Miss 'url' argument to 'ws'.");
        return 0;
    }
    else
    {
        url = replace_string(url, "ws://", "http://");
    }

    return request("GET", url, query, (["Upgrade":"websocket", "Connection":"Upgrade"]) + (header || ([])));
}
