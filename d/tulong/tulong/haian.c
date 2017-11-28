#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "蔚蓝海边");
        set("long", @LONG
无边无际的大海就在眼前了。海风拂面，一洗过往旅客的一路劳顿。海风清
凉，略有点咸味，海面微微泛着波浪。碧蓝的的海水上面涌动的洁白的浪花，海
面飘着轻轻的薄雾。茫茫的大海上没有一点帆影，极目远眺，海天交界处蒙蒙一
片，分不出哪里是海，哪里是天。
LONG );

        set("exits", ([
                "south" : "/d/tulong/tulong/haigang",
                "east" :  "/d/tulong/tulong/shatan",
        ]));

        set("objects", ([
                "/d/tulong/yitian/npc/huiyue" : 1,
                "/d/tulong/yitian/npc/miaofeng" : 1,
        ]));

        set("no_clean_up", 0);
        set("outdoors", "tulong");
        setup();
}

