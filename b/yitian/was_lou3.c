#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "万安寺第三层");
        set("long", @LONG
这里是万安寺的第三层，寺楼里站着几个身着火红袈裟的和尚。一见你上楼，
立马向你扑来。
LONG);
        set("exits", ([
            "down"  : __DIR__"was_lou2",
            "up"    : __DIR__"was_lou4",
        ]));

        set("objects", ([
            __DIR__"npc/18jingang-5jian" :5,
        ]));

        set("no_clean_up", 0);
        setup();
}
int valid_leave(object me, string dir)
{
        if (dir == "up" && objectp(present("jian seng", environment(me))))
           return notify_fail(CYN "剑僧齐声喝道：哪里走？滚下来！\n" NOR);

        if (dir == "down" && objectp(present("jian seng", environment(me))))
           return notify_fail(CYN "剑僧齐声喝道：哪里逃？纳命来！\n" NOR);

        return ::valid_leave(me, dir);
}

