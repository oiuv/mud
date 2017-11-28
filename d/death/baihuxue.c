#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", GRN "【白虎穴】" NOR);
        set("long", GRN @LONG

                    白         虎         穴

    这里是寂灭司后面黑森林最深处的一个洞穴，洞的上部空旷，存有
少量的空气，你终于可以换气了。传说四神兽之一的白虎就栖息于此地。
洞内幽暗无比，令你根本看不清周围的事物。

LONG NOR );

        set("objects", ([
                __DIR__"npc/baihu" : 1,
        ]));
        
        set("exits", ([
                "south" : __DIR__"heisenlin/exit",
        ]));

        set("baihu", 1);
        setup();
}
