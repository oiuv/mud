#include <ansi.h>
inherit RIVER;

void create()
{
        set ("short", "黄河北岸");
        set ("long", @LONG
你来到了黄河 (river)的岸边，只见黄色的河水汹涌的向
下流去。这就是中国的母亲河——黄河。你看了一下四周，还
好不远处有一个小小的渡口，刚好有一艘渡船，船上已经有几
个人，老船夫正看着你，好象等你上来以后就马上要开船了。
LONG);
        set("arrive_room", "/d/lanzhou/river-nan");
        set("exits", ([
                "north" : "/d/huanghe/xiaojiaqiao",
        ]));

        set("resource/fish", ({ "/clone/fish/liyu",
                                "/clone/fish/jiyu",
                                "/clone/fish/qingyu",
                                "/clone/fish/caoyu",
        }));
        set("outdoors", "lanzhou");
        setup();
        replace_program(RIVER);
}