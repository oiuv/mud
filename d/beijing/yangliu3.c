#include <room.h>
inherit ROOM;

void create()
{
        set("short", "杨柳胡同");
        set("long", @LONG
这里是杨柳胡同的底端，走到这里，行人已经不多见了。一路上，胡同两
旁四合院的大门紧闭着，唯独这里南边的一个四合院大门是敞开着的。你不竟
想去看一看。
LONG );
       set("exits", ([
                "north" : __DIR__"yangliu2",
                "south" : __DIR__"qingmu_men",
        ]));

        set("outdoors", "beijing");
        setup();
        replace_program(ROOM);
}

