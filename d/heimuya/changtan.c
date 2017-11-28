#include <ansi.h>
inherit RIVER;

void create()
{
        set("short", "长滩");
        set("long", @LONG
这片长滩不时有日月教教众乘船往来，滩头插着一面日月
教的旗帜。对面的江 (river)上划着几艘日月神教的小船，外
来的船只很多，但是并没有船敢在这里停留，要过对岸只有靠
日月教自己的船只了。
LONG);
        set("arrive_room", "/d/heimuya/xingxingtan");
        set("exits", ([
                "westup"   : __DIR__"shandao1",
        ]));
        set("objects", ([
                __DIR__"npc/huang" : 1,
        ]));

        set("resource/fish", ({ "/clone/fish/liyu",
                                "/clone/fish/jiyu",
                                "/clone/fish/qingyu",
                                "/clone/fish/caoyu",
        }));
        set("outdoors", "heimuya");
        setup();
        replace_program(RIVER);
}

