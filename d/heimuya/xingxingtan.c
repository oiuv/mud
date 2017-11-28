#include <ansi.h>
inherit RIVER;

void create()
{
        set ("short", "猩猩滩");
        set ("long", @LONG
只见一片长滩，山石殷红如血，水流湍急，这便是有名的
猩猩滩，对面的江 (river)上划着着几艘小船，要过对面就要
靠这几艘小船了。
LONG);
        set("arrive_room", "/d/heimuya/changtan");
        set("exits", ([
                "southup" : __DIR__"shidao2",
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