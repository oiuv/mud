#include <login.h>
#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "南岩宫地下室");
        set("long", @LONG
这是一个干燥洁净的地下室，四壁用光滑的大理石砌就而
成，十数支松明照得这里通明透亮。
LONG );
        set("objects", ([
           	CLASS_D("wudang") +"/xiaosong": 1,
        ]));

        set("exits", ([
                "up"     : __DIR__"nanyangong",
                "east"   : __DIR__"nanyan1",
                "west"   : __DIR__"nanyan2",
                "south"  : __DIR__"nanyan3",
                "north"  : __DIR__"nanyan4",
        ]));
        setup();
}

int valid_leave(object me, string dir)
{
    	if (dir == "up")
    	{
       		if (me->query_skill("taiji-shengong", 1) < 80)
              		return notify_fail(HIY "你试着推了推顶上的砖盖，触"
                                           "手冰凉，纹丝不动。\n" NOR);

          	message_sort(HIY "\n$N" HIY "全身运足太极神功，拔身错步，嘿地"
                             "一声，举起双掌向上猛击。只见一股白气自$N" HIY
                             "掌心而出，迅猛无比地击中顶上的砖盖。克剌剌一"
                             "声巨响，砖盖被震成无数小碎片四散飘飞。露出一"
                             "个向上的洞口来。\n\n" NOR, me );
     	}
     	return ::valid_leave(me, dir);
}
