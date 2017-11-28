#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "后殿");
        set("long", @LONG
这里是万安寺的后殿，非常的宽敞明亮，佛像前摆着一个供桌，桌上的香炉
中插着几柱香，地上摆着一些蒲团。右首处一个木制阶梯，可以通向万安寺的寺
楼。
LONG );
        set("exits", ([
            "south"  : "/d/tulong/yitian/was_zoulang3",
            "up"    : "/d/tulong/yitian/was_lou2",
        ]));

        set("objects", ([
            "/d/tulong/yitian/npc/18jingang-5dao" :5,
        ]));
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

