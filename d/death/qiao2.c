#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", NOR + WHT "【奈河桥】" NOR);
        set("long", NOR + WHT @LONG

                    奈         河         桥

    这里就是著名的阴间通道「奈河桥」，你走在这长长的石制拱桥上
面，许多亡魂正哭哭啼啼地从你身旁擦身而过，桥的另一端站着一个牛
头人身的守卫，仔细的查看着过往的亡魂。


LONG NOR );
        set("exits", ([
                // "north" : __DIR__"hell1",
                "north" : __DIR__"youmingjie",
                "south" : __DIR__"qiao1",
        ]));
        set("objects", ([
                __DIR__"npc/niutou":1,
                __DIR__"npc/ghost":1,
        ]));
        set("item_desc", ([
                "north": HIW "\n奈河桥的另一端被烟雾所笼罩，仿佛没有"
                         "尽头，你什么都看不清。\n" NOR
        ]));

        set("no_sleep_room", 1);

        setup();
}
int valid_leave(object me, string dir)
{
        //int i;
        //object ob;
        me = this_player();
        if (dir == "north")
        {
                if (objectp(present("niu tou", environment(me))))
                        return notify_fail(CYN "牛头看了你一眼，喝道：你还不滚"
                                           "回去还阳，来这里凑什么热闹！\n" NOR);
        }
        return ::valid_leave(me, dir);
}
