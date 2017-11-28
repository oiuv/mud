#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", HIM "蝴蝶泉" NOR);
        set("long", @LONG
在向前行，一路上嫣红姹紫，遍山遍野都是鲜花。春光烂漫已极。转过
一树花丛，眼前出现一眼泉水，泉水清澈见底，散发出一种沁人心脾的清凉。
泉水的旁边，飞舞一群群的蝴蝶，或花或白，或黑或紫，翩翩起舞。蝴蝶并
不畏人，飞近时便在人们的身上停留。
LONG    );

        set("outdoors", "tiezhang");
        set("exits", ([
                "northwest" : __DIR__"guajia",
        ]));

        set("no_clean_up", 0);
        set("resource", ([
                "water" : 1,
        ]));

        setup();
        replace_program(ROOM);
}

