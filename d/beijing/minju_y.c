#include <room.h>
inherit ROOM;

void create()
{
        set("short", "四合院");
        set("long", @LONG
四合院是北京民居的典型，杨柳胡同中的这个四合院看来已经过了一段很
长久的历史了。四合院的大门破旧不堪，大门原本漆着的颜色已无法辨认，门
上还贴着一幅残破的对子，字迹模糊不清，猜想也就无非是些“万事如意”什
么的。你刚跨进四合院的大门，院内的居民用奇怪的眼神上下打量着你，没事
还是趁早离开吧。
LONG );
       set("exits", ([
                "east" : __DIR__"yangliu1",
        ]));
        set("objects", ([
                __DIR__"npc/jumin1" : 1,
                "/clone/npc/walker" : 1,
        ]));
        set("outdoors", "beijing");
        setup();
        replace_program(ROOM);
}

