#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "情花坳");
        set("long", @LONG
前方是一片径长两丈的园形草地(caodi)，一阵醉人心魄的
花香扑鼻而来，外边密密层层的围满了情花。不论从那个方位
出来，都有八九丈地面生满情花。任你武功再强，也决不能一
跃而出，纵然跃至半路也是难能。
        ====此处等待补充。。。。。====
LONG);
        set("outdoors", "jueqing");
        set("exits", ([
               "westdown" : __DIR__"shanyao",
        ]));

        set("objects", ([
                __DIR__"npc/dizi1" : 1,
                __DIR__"npc/dizi2" : 1,
        ]));  

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}


