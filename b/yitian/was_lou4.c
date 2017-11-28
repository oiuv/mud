#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "万安寺四楼大厅");
        set("long", @LONG
这里是万安寺四楼的大厅，相当的宽敞。一个明艳少女正座中堂，少女
前方有一块巨大的红木制武器架，左右站满了亲兵，排场很是气派。
LONG );
        set("exits", ([ 
                "down" : __DIR__"was_lou3",
        ]));
        set("objects", ([
                "/d/tulong/yitian/npc/ada" : 1,
                "/d/tulong/yitian/npc/aer" : 1,
                "/d/tulong/yitian/npc/asan" : 1,
                "/d/tulong/yitian/npc/he" : 1,
                "/d/tulong/yitian/npc/zhao" : 1,
                "/d/tulong/yitian/obj/shelf" : 1,
        ]) );

        setup();
}
