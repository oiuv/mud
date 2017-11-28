#include <room.h>
#include <ansi.h>

inherit ROOM;
int do_break(string arg);

void create()
{
    set("short", "庄府大门");
    set("long", @LONG
这里就是文士庄允城的旧居。自从他被朝廷抓走后，这里好象就
没有人住了。一扇大门(men)紧锁着， 周围是高高的围墙(wall)。一
切都很干净，并没有积多少灰尘。
LONG );
    set("exits", ([
        "south" : __DIR__"zhuang2",
    ]));
    set("item_desc", ([
        "men" : "这扇门是锁着的，除非你打破(break)它。\n",
    ]) );
    setup();
}

void init()
{
    object /*book,*/ me;
    me = this_player();
    add_action("do_break", "break");
}

int do_break(string arg)
{
    int n;
    n = this_player()->query("neili");
    if (! arg || arg != "men")
    {
        write("不要随便打碎别人的东西！\n");
        return 1;
    }


    message_vision("$N走到门前，深吸一口气，双掌同时拍出。\n",
                   this_player());
        
    if (n >= 200)
    {
        message_vision("$N只听一声轰响，$N把门震开了！\n",
                       this_player());
        set("exits/north", __DIR__"zhuang5");
        this_player()->set("neili",n-200);
        remove_call_out("close");
        call_out("close", 5, this_object());
    } else
    {
        message_vision("$N大吼一声“开！”，结果什么也没发生。"
                       "看来$N的内力不够强。\n", this_player());
        this_player()->set("neili",0);
    }

    return 1;
}