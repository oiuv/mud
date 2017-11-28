#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "黑沙潭");
        set("long", 
"黑沙潭又称黑龙潭，深不见底，水色苍黑，瀑布流急，水\n中黑泡共白沫"
"徜徉，幽幽可怖。石壁上「" HIY "海南龙湫"NOR "」四字据载\n为大宋徽宗赵"
"佶所留。瘦金字体，一如往昔。\n"
);
        set("exits", ([ 
               "up"  : __DIR__"shanjian",
        ]));

        set("outdoors", "henshan");

        set("no_clean_up", 0);
        setup();
}

int valid_leave(object me, string dir)
{
    if ((random((int)me->query_skill("dodge")) <= 30) && dir=="up")    
    {
        return notify_fail("你使劲儿一蹦，离瀑布顶还有数丈远就掉了下来，摔的鼻青脸肿。\n");
    }
    if ((random((int)me->query_skill("dodge")) <= 35) && dir=="up")    
    {
        return notify_fail("你奋力一跃，却离瀑布顶还有一丈多远，看来是白费力气。\n");
    }
    if ((random((int)me->query_skill("dodge")) <= 40) && dir=="up")    
    {
        return notify_fail("你纵身而起，离瀑布顶只差一点点了，再加把劲。\n");
    }

    return ::valid_leave(me, dir);
}

