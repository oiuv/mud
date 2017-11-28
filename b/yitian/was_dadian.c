#include <ansi.h>

inherit ROOM;


void create()
{
        set("short", "大殿");
        set("long", @LONG
这里是万安寺的大殿，非常的宽敞明亮，这里本是万安寺众僧早晚课之
处，佛像前摆着一个供桌，桌上的香炉中插着几柱香。地上摆着一些蒲团。
几个和尚盘膝做在上面。左右两旁是两个偏殿。
LONG );
        set("exits", ([
                "north" : __DIR__"was_zoulang3",
                "south" : __DIR__"was_zoulang2",
                "east" : __DIR__"was_piandiane",
                "west" : __DIR__"was_piandianw",
        ]));

        set("objects", ([
            __DIR__"npc/18jingang-4bo" :4,
        ]));

        setup();
}
int valid_leave(object me, string dir)
{
        if (dir == "north" && objectp(present("bo seng", environment(me))))
           return notify_fail(CYN "钹僧齐声喝道：哪里走？滚下来！\n" NOR);

        if (dir == "south" && objectp(present("bo seng", environment(me))))
           return notify_fail(CYN "钹僧齐声喝道：哪里逃？纳命来！\n" NOR);

        if (dir == "west" && objectp(present("bo seng", environment(me))))
           return notify_fail(CYN "钹僧齐声喝道：哪里逃？纳命来！\n" NOR);

        if (dir == "east" && objectp(present("bo seng", environment(me))))
           return notify_fail(CYN "钹僧齐声喝道：哪里逃？纳命来！\n" NOR);

        return ::valid_leave(me, dir);
}

