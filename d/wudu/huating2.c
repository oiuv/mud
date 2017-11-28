#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "栖凤亭");
        set("long", @LONG
这里是一个花园中的小亭子，雕梁画栋，古色古香。亭子
当中立着座青铜香炉(lu)，炉中正冒着许许清烟，也不知是燃
着什么东西，烟味颇为刺鼻。
LONG);
        set("exits", ([
                "west" : __DIR__"huayuan2",
                "north" : __DIR__"huating1",
        ]));

        set("item_desc", ([
                "lu" : YEL "\n这是一座青铜香炉，模样颇为古旧，香炉周"
                       "围似乎有移动过的痕迹。\n" NOR,
        ]));

        setup();
}

void init()
{
        add_action("do_move", "move");
}

int do_move(string arg)
{
        object me = this_player();

        if (! arg || arg != "lu")
                return notify_fail("你要移动什么？\n");

        if (query("exits/down"))
                return notify_fail("香炉已经被移开了。\n");

        message_vision(HIY "\n$N" HIY "刚一推动香炉，香炉却自己"
                       "向一方移开，地面豁然现出一个洞口。\n\n"
                       NOR, me);
        set("exits/down", __DIR__"midao");
        remove_call_out("close");
        call_out("close", 8, this_object());

        return 1;
}

void close(object room)
{
        message("vision", WHT "忽然只听「喀喀喀」几声，香炉缩回"
                          "原地，把密道挡住了。\n" NOR, room);
        room->delete("exits/down");
}
