#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "绝情山庄");
        set("long", @LONG
此处便是绝情山庄，但见山庄掩映于葱翠的林木之下，四
处繁花遍布，景致宜人。时有醉人的花香飘过，间杂着清脆的
百鸟之声，令人不由心旷神怡。
LONG);
        set("outdoors", "jueqing");
        set("exits", ([
               "enter" : __DIR__"dating",
               "south" : __DIR__"shiban",
        ]));

        set("objects", ([
                __DIR__"npc/dizi1" : 4,
                __DIR__"npc/dizi2" : 4,
                CLASS_D("jueqing") + "/fan" : 1,
        ]));  

        set("no_clean_up", 0);

        setup();
}

int valid_leave(object me, string dir)
{
        object guard;

        if (dir != "enter"
           || ! objectp(guard = present("fan yiweng", this_object())))
                return ::valid_leave(me, dir);

        return guard->permit_pass(me, dir);
}

