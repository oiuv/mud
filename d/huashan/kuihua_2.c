#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "山崖");
        set("long", @LONG
这里是玉女祠山下的陡峭山崖，离前边的山崖比较远，看来想要爬过
去并不容易。
LONG );
        set("outdoors", "huashan");
        setup();
}

void init()
{
        add_action("do_climb", "climb");
}

int do_climb()
{
        object me = this_player();
        int n = me->query_skill("dodge", 1);

        message_vision( HIY "$N" HIY "深吸了一口气，慢慢沿着山壁向上"
                        "爬。\n" NOR, this_player());
        if (n > 100)
        {
                message_vision(HIC "$N" HIC "爬了半天，手肘膝盖都已"
                               "被坚石割得鲜血淋漓，终于爬上了上面的"
                               "山崖。\n" NOR, this_player());

                me->move(__DIR__"kuihua_1");

                message_vision(HIC "$N" HIC "从下面的山崖爬了上来"
                        "。\n" NOR, this_player());
        } else
        {
                message_vision(HIR "$N" HIR "爬了一会，一个不留神，"
                               "跌了下去。\n" NOR, this_player());
                me->unconcious();
        }
        return 1;
}
