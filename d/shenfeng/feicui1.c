#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "翡翠池");
        set("long", @LONG
这里四周群山围绕，就如一只大盆一般，盆子中心碧水莹
然，绿若翡翠，是个圆形的大水池(pool)，隔了这千百年，竟
然并不曾干枯，想来池底另有活水源头。你走近池边，伸下手
去只觉清凉入骨，双手捧起水来但见池水澄净清澈，更无纤毫
苔泥，原来圆池四周都是翡翠，池水才映成绿色。只见洁白的
玉峰映在碧绿的池中，明艳洁净，幽绝清绝。
LONG);
        set("resource/water", 1);
        set("objects", ([ 
                __DIR__"obj/skeleton3" : 1,
	]));

        set("item_desc", ([
                "pool" : HIC "\n池水澄净清澈，更无纤毫苔泥，圆池四周都是翡翠。\n" NOR,
        ]));

        set("exits", ([ 
        	"up" : __DIR__"yongdao5",
	]));
        setup();
}

void init()
{
        add_action("do_jump", "jump");
        add_action("do_jump", "tiao");
}

int do_jump(string arg)
{
        object me = this_player();
        object cloth = me->query_temp("armor/cloth");

        if (! arg || arg == "")
                return 0;

        if (arg == "pool")
        {
                message_vision(HIC "\n$N" HIC "望着翡翠池，再也禁不住诱惑，扑通一声"
                               "跳进了水中。\n\n" NOR, me);

                me->move(__DIR__"feicui2");

                message_vision(HIC "\n$N" HIC "扑通一声跳进了翡翠池中。\n\n" NOR, me);

                if (cloth && cloth->washed(120 + random(120)))
                        tell_object(me, "你身上的" + cloth->name() + "全湿透了。\n");

                return 1;
        }
}
