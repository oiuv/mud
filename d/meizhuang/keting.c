#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "迎客亭"); 
        set("long", @LONG
通过四雅清风，你来到了梅庄的迎客亭，这里虽然只有一张石桌
和几个石凳，但却是一尘不染，石凳和石桌之间的空隙很大，显是方
便来客与主人相互寒暄。
LONG
        );
        set("exits", ([
                "south" : __DIR__"dating",
                "north" : __DIR__"senlin1",
        ]));

        set("objects", ([
                CLASS_D("meizhuang") + "/ding" : 1,
        ]));

        set("no_clean_up", 0);

        setup();
}

int valid_leave(object me, string dir)
{
        object ding;

        if (dir != "north" ||
            ! objectp(ding = present("ding jian", this_object())))
                return ::valid_leave(me, dir);

        return ding->permit_pass(me, dir);
}
