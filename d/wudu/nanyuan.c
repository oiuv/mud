inherit ROOM;
#include <ansi.h>

void create()
{
        set("short", "南院");
        set("long", @LONG
这里是南跨院，院子里有棵很大的榕树，将天空大部遮住
院子里静悄悄的，几只高大的藏獒在树下来回踱步。 
LONG);
        set("outdoors", "wudujiao");

        set("exits", ([
                "east" : __DIR__"yaoshi",
                "south" : __DIR__"liandu",
                "west" : __DIR__"xiangfang",
                "north" : __DIR__"lianwu",
        ]));
        set("objects", ([
                  "/clone/quarry/gou3" : 2,
        ]));
        setup();
}

void init()
{
        add_action("do_climb", "climb");
}

int do_climb(string arg)
{
       
        object me = this_player();
        object ob;

        if (! arg || arg != "tree")
                return notify_fail("你要爬什么？\n");

        message_vision(HIC "$N" HIC "撮了撮手，攀着榕树的枝杈三下两"
                       "下就爬了上去。\n" NOR, me);

        ob = load_object(__DIR__"tree");
        ob = find_object(__DIR__"tree");
        message("vision", me->query("name") + "从下面爬了上来。\n", ob);
        me->move(__DIR__"tree");
        return 1;
}

