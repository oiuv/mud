#include <ansi.h>
#include <socket.h>
#include <socket_err.h>

inherit ITEM;

nosave mapping status = ([]);
nosave object receiver;

void create()
{
    set_name(CYN "成语词典" NOR, ({"idiom book", "book", "idiom"}));
    if (clonep())
        set_default_object(__FILE__);
    else
    {
        set("long", HIY "这是一本厚厚的成语词典，你可以用来查询任何成语的读音、解释和出处(指令：idiom [成语])。\n" NOR);
        set("unit", "本");
        set("no_get", "这是公共图书，你还是别拿走的好。\n");
        set("material", "paper");
    }
}

void init()
{
    add_action("do_read", "idiom");
}

int do_read(string arg)
{
    int fd;
    int ret;
    string host = "api.avatardata.cn";
    string addr = "121.42.196.237 80";
    string key = "670024f0900f485cb3ac4ec63aa82083";
    string path;

    receiver = this_player();
    if (is_chinese(arg))
    {
        path = "/ChengYu/Search?key=" + key + "&keyWord=" + arg;
        msg("info", "$ME翻开成语词典开始查找和 " + arg + " 相关的成语。\n", receiver);
    }
    else if (strlen(arg) == 36)
    {
        path = "/ChengYu/LookUp?key=" + key + "&id=" + arg;
        msg("info", "$ME翻开成语词典开始阅读指定页的成语。\n", receiver);
    }
    else
    {
        path = "/ChengYu/Random?key=" + key;
        msg("info", "$ME翻开成语词典开始阅读其中的成语。\n", receiver);
    }

    fd = socket_create(STREAM, "receive_callback", "socket_shutdown");
    status[fd] = ([]);
    status[fd]["host"] = host;
    status[fd]["path"] = path;
    status[fd]["keyword"] = arg;

    ret = socket_connect(fd, addr, "receive_data", "write_data");
    if (ret != EESUCCESS)
    {
        tell_object(receiver, "这本书不知道被谁涂抹的乱七八糟的，什么内容也看不清了。\n");
        socket_close(fd);
    }

    return 1;
}

void write_data(int fd)
{
    socket_write(fd, "GET " + status[fd]["path"] + " HTTP/1.1\nHost: " + status[fd]["host"] + "\n\r\n\r");
}

void receive_data(int fd, mixed result)
{
    string idiom;
    result = result[strsrch(result, "{")..];
    // debug_message(sprintf("%d || %O", strlen(result), result));
    if (strsrch(result, "total") > -1)
    {
        int total;
        result = json_decode(result);
        total = result["total"];
        idiom = HIY "和 " + status[fd]["keyword"] + " 相关的成语共有 " + total + " 条，索引如下：" NOR + "\n";
        result = result["result"];
        idiom += "----------------------------------------\n";
        foreach (mapping list in result)
        {
            idiom += HIC "成语：" + list["name"] + "\n索引：" + list["id"] + NOR + "\n";
        }
        idiom += "----------------------------------------\n";

        if (total > 20)
        {
            idiom += HIR "相关成语超过二十条，推荐使用更精确的关键词查询。" NOR "\n";
        }

        idiom += HIG "可以使用 `idiom 索引` 阅读指定成语。" NOR "\n";

        tell_object(receiver, idiom);
    }
    else
    {
        result = json_decode(result);
        if (result["error_code"])
        {
            tell_object(receiver, "没有找到相关索引成语。\n");
        }
        else
        {
            result = result["result"];
            idiom = "----------------------------------------\n";
            idiom += HIY "成语：" + result["name"] + NOR "\n";
            idiom += HIW "读音：" + result["spell"] + NOR + "\n";
            idiom += "----------------------------------------\n";
            idiom += HIC "解释：" + result["content"] + NOR + "\n";
            if (result["derivation"])
            {
                idiom += HIW "出处：" + result["derivation"] + NOR + "\n";
            }
            if (result["samples"])
            {
                idiom += HIW "示例：" + result["samples"] + NOR + "\n";
            }
            idiom += "----------------------------------------\n";
            tell_object(receiver, idiom);
        }
    }
}

void receive_callback(int fd, mixed result, string addr)
{
    // if (stringp(result))
    // {
    //     debug_message(sprintf("receive_callback(%d, %O, %s)\n", fd, result, addr));
    // }
}

void socket_shutdown(int fd)
{
    socket_close(fd);
}
