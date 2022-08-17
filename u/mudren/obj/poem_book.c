/**
 * @file poem_book.c
 * @author 雪风 (雪风@mud.ren)
 * @brief 因诗词API已失效，此书仅为代码示例用
 * @version 1.1
 * @date 2022-08-16
 *
 * @copyright Copyright (c) 2022
 *
 */
#include <ansi.h>
#include <socket.h>
#include <socket_err.h>

inherit ITEM;

nosave mapping status = ([]);
nosave object receiver;

void create()
{
    set_name(CYN "诗词精选" NOR, ({"poem book", "book", "poem"}));
    if (clonep())
        set_default_object(__FILE__);
    else
    {
        set("long", HIY "这是一本厚厚的诗词精选读本，据说收录了中国古今数万首诗词，没事可以读读(指令：poem [关键词])。\n" NOR);
        set("unit", "本");
        set("no_get", "这是公共图书，你还是别拿走的好。\n");
        set("material", "paper");
    }
}

void init()
{
    add_action("do_read", "poem");
}

int do_read(string arg)
{
    int fd;
    int ret;
    string host = "api.avatardata.cn";
    string addr = "121.42.196.237 80";
    string key = "a1c9cf0f475549779b7620d7ac694459";
    string path;

    receiver = this_player();
    if (is_chinese(arg))
    {
        path = "/TangShiSongCi/Search?key=" + key + "&keyWord=" + arg;
        msg("info", "$ME翻开【诗词精选】开始查找和 " + arg + " 相关的诗词。\n", receiver);
    }
    else if (strlen(arg) == 36)
    {
        path = "/TangShiSongCi/LookUp?key=" + key + "&id=" + arg;
        msg("info", "$ME翻开【诗词精选】开始阅读指定页的诗词。\n", receiver);
    }
    else
    {
        path = "/TangShiSongCi/Random?key=" + key;
        msg("info", "$ME翻开【诗词精选】开始阅读其中的诗词。\n", receiver);
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
    string poem;
    result = result[strsrch(result, "{")..];
    // debug_message(sprintf("%d || %O", strlen(result), result));
    if (strsrch(result, "total") > -1)
    {
        int total;
        result = json_decode(result);
        total = result["total"];
        poem = HIY "本书中内容包含 " + status[fd]["keyword"] + " 的诗词共有 " + total + " 首，索引如下：" NOR + "\n";
        result = result["result"];
        poem += "----------------------------------------\n";
        foreach(mapping list in result)
        {
            poem += HIC "标题：" + list["name"] + "\n页码：" + list["id"] + NOR + "\n";
        }
        poem += "----------------------------------------\n";

        if (total > 20)
        {
            poem += HIR "相关内容超过二十条，推荐使用更精确的关键词查询。" NOR "\n";
        }

        poem += HIG "可以使用 poem 页码 阅读指定页的诗词。" NOR "\n";

        tell_object(receiver, poem);
    }
    else if (strlen(result) < 400 && strsrch(result, "result") > -1)
    {
        result = json_decode(result);
        if (result["error_code"])
        {
            tell_object(receiver, "这本书没有你要阅读的页码呢。\n");
        }
        else
        {
            result = result["result"];
            poem = HBRED + result["biaoti"] + NOR + "\n";
            poem += HIW "作者：" + result["zuozhe"] + NOR + "\n";
            poem += "----------------------------------------\n";
            poem += HIC + result["neirong"] + NOR + "\n";
            poem += "----------------------------------------\n";
            tell_object(receiver, poem);
        }
    }
    else
    {
        tell_object(receiver, "这页不知道被谁涂抹的乱七八糟的，什么内容也看不清。\n");
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
