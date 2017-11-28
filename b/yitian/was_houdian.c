#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "后殿");
        set("long", @LONG
这里是万安寺的后殿，非常的宽敞明亮，佛像前摆着一个供桌，桌上的
香炉中插着几柱香，地上摆着一些蒲团。右首处一个木制阶梯，可以通向万
安寺的寺楼。
LONG);
        set("exits", ([
            "south"  : __DIR__"was_zoulang3",
            "up"    : __DIR__"was_lou2",
        ]));

        set("objects", ([
            __DIR__"npc/18jingang-5dao" :5,
        ]));

        set("no_clean_up", 0);
        setup();
}
int valid_leave(object me, string dir)
{
        if (dir == "up" && objectp(present("dao seng", environment(me))))
           return notify_fail(CYN "刀僧齐声喝道：哪里走？滚下来！\n" NOR);

        if (dir == "south" && objectp(present("dao seng", environment(me))))
           return notify_fail(CYN "刀僧齐声喝道：哪里逃？纳命来！\n" NOR);

        return ::valid_leave(me, dir);
}

