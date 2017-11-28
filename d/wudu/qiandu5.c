#include <ansi.h> 
inherit ROOM;
string* npcs = ({
        "/clone/worm/shishixie",
        "/clone/worm/tieguxie",
        "/clone/worm/heiguafu",
        "/clone/worm/jinxianwugong",
        "/clone/worm/datouwugong",
        "/clone/worm/changaoxie",
        "/clone/worm/huibeixie",
});

void create()
{
        set("short", HIR "千毒窟" NOR);
        set("long", @LONG
这里是一个天然形成的石洞，里面深邃广大。洞顶悬挂着许多钟
乳石，不时传来几声滴答的水声。走在洞中，洞内阴暗潮湿，身旁忽
然传来一阵“咝咝”的声音。
LONG);

        set("exits", ([
                "west" : __DIR__"qiandu2",
        ]));
        set("objects", ([
                npcs[random(sizeof(npcs))] : 1,
                npcs[random(sizeof(npcs))] : 1,
                npcs[random(sizeof(npcs))] : 1,
                npcs[random(sizeof(npcs))] : 1,
        ]));

        setup();
        //replace_program(ROOM);
}
