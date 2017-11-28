#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "青石大道");
        set("long", @LONG
你走在一条青石大道上，四周静悄悄的。四周是浓密的树
林，阴森森的十分怕人。西北方不远就是陕鄂的边界了。北边
却是一片草地。你抬头向远方眺望，隐隐约约能够看到武当山
的影子，只令人想飞奔而上。
LONG);
        set("outdoors", "wudang");
        set("exits", ([
            "northwest" : __DIR__"wdroad6",
            "north"     : "/d/xiangyang/caodi6",
            "east"      : __DIR__"wdroad4",
            "southdown" : "/d/jingzhou/jzbeimen",
        ]));
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

        if (me->query_skill("tiyunzong", 1) < 160 ||
            me->query_skill("dodge", 1) < 160)
        {
                message_vision("$N跳了跳，原地蹦哒了一会儿。\n", me);
                return 1;
        }

        if (me->query("neili") < 150)
        {
                tell_object(me, "你的内力不够，还是休息一下再说吧。\n");
                return 1;
        }

        me->add("neili", -120);

        message_sort(HIC "\n$N" HIC"深吸一口气，迈开大步，双足"
                     "如飞，踩着山间杂草，飘然而起，直奔那武当"
                     "山去了！转瞬不见，只留下远远一个影子。\n"
                     "\n" NOR, me);
        me->move("/d/wudang/guangchang");
        tell_object(me, "片刻，你已经飞身上了武当山上。\n");
        message("vision", "只见一阵清风掠过，" + me->name() +
                "已经飘然而至。\n", environment(me), ({ me }));
        return 1;
}
