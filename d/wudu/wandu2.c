#include <ansi.h> 
inherit ROOM;

string* npcs = ({
        "/clone/worm/xixuezhu",
        "/clone/worm/renmianzhu",
        "/clone/worm/tianwu",
        "/clone/worm/jiuweixie",
        "/clone/worm/shishixie",
        "/clone/worm/tieguxie",
        "/clone/worm/heiguafu",
        "/clone/worm/jinxianwugong",
});

void create()
{
        set("short", RED "万毒窟" NOR);
        set("long", @LONG
这里是一个天然形成的石洞，里面深邃广大。洞顶悬挂着许多钟
乳石，不时传来几声滴答的水声。走在洞中，洞内阴暗潮湿，身旁忽
然传来一阵“咝咝”的声音。洞内似乎还有个小一点的支洞。
LONG);

        set("exits", ([
                "south" : __DIR__"wandu3",
                "north" : __DIR__"wandu1",
        ]));
        set("objects", ([
                npcs[random(sizeof(npcs))] : 1,
                npcs[random(sizeof(npcs))] : 1,
        ]));
    

        setup();
        //replace_program(ROOM);
}
