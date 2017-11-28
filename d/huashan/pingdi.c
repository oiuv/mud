// Room: /d/huashan/pingdi.c

#include <room.h>
inherit ROOM;

void create()
{
        set("short", "山间平地");
        set("long", @LONG
你走在中条山山间平地上。靠东山壁上有一小屋。传闻当年华山
玉女峰剑气两宗大对决，中计败北的剑宗弟子大多隐匿中条山。难道
就是这里？林中冷风轻吹门响。很失意的感觉。
LONG );
        set("exits", ([ /* sizeof() == 4 */
            "north" : __DIR__"shangu",
            "east"  : __DIR__"xiaowu",
        ]));
        set("outdoors", "huashan");
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

