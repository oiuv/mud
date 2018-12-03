#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "云端");
        set("long", HIW"
    这里是九霄云外，好神奇的地方啊，只看朵朵白云飘，让
人心旷神怡。
\n");
        set("exits", ([
                "down"  : "/d/city/tree",
                "up"  : "/d/sky/tianmen",
        ]));

        set("objects",([
                "/d/city/npc/yanruyu" : 1,
        ]));

        set("valid_startroom", 1);
        set("outdoors", "sky");
        setup();
        replace_program(ROOM);
}
