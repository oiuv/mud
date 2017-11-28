#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "武当广场");
        set("long", @LONG
这是一个由大石板铺成的广场，是武当弟子学习武功和互
相切磋的地点。周围种满了梧桐树，一到秋天就是满地的落叶。
有个年纪轻轻的道童正在打扫。南边是灵霄宫三清殿。
LONG);

        set("objects", ([
                CLASS_D("wudang") +"/daotong" : 2,
        ]));

        set("exits", ([
                "northdown"  : __DIR__"zixiaogate",
                "south"      : __DIR__"sanqingdian",
                "eastdown"   : __DIR__"tyroad1",
                "east"       : __DIR__"shanlu2",
        ]));

        set("outdoors", "wudang");
        setup();
}

void init()
{
        add_action("do_float", "float");
        add_action("do_float", "piao");
}

int do_float()
{
        object me;

        me = this_player();

        if (me->query_skill("tiyunzong", 1) < 120
           || me->query_skill("dodge", 1) < 120)
        {
                message_vision("$N跳了跳，原地蹦哒了一会儿。\n", me);
                return 1;
        }

        if (me->query("neili") < 100)
        {
                tell_object(me, "你的内力不够，还是休息一下再说吧。\n");
                return 1;
        }

        me->add("neili", -70);

        message_sort(HIC "\n$N" HIC"深吸一口气，纵声长笑，只"
                     "见人已飘然而起，态似神仙，晃晃悠悠的落"
                     "下山去了，笑音犹然未绝。\n\n" NOR, me);
        me->move("/d/wudang/wdroad5");
        tell_object(me, "片刻，你已经落到了山脚下。\n");
        message("vision", "忽然一阵笑声传来，只见" + me->name() +
                "飘然落下，有若神仙。\n", environment(me), ({ me }));
        return 1;
}
