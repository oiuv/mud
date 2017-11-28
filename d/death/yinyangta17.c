#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", HIB "阴阳塔" NOR);
        set("long", HIB @LONG
这是地狱中最高的一座塔，高约三百余尺，共有十八级。相传塔顶
住有神兽朱雀，这个传言也不知是真是假。
LONG NOR
        );

        set("exits", ([
                "up"   : __DIR__"yinyangta18",
                "down" : __DIR__"yinyangta16",
        ]));
        
        set("objects",([
                __DIR__"npc/mamian" : 1,
        ]));
        
        setup();
}

int valid_leave(object me, string dir)
{
        int i;
        object ob;
        me = this_player();
        if (dir == "up")
        {
                if (objectp(present("ma mian", environment(me))))
                        return notify_fail(CYN "马面看了你一眼，喝道：你还不滚"
                                           "回去还阳，来这里凑什么热闹！\n" NOR);
        }
        return ::valid_leave(me, dir);
}
