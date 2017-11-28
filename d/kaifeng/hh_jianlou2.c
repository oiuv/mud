#include <ansi.h> 

inherit ROOM;

void create()
{
        set("short", "藏剑楼二层");
        set("long", @LONG
这里是红花会二当家无尘道长的静修之处，无尘道长号称
追魂夺命剑，因此将此地命为「藏剑楼」。楼分三层，这二楼
内无任何陈设。地面上划有一个八卦 (bagua)，似乎是为修炼
步法所用。
LONG);
        set("no_clean_up", 0);
        set("item_desc", ([
                "bagua" : WHT "\n这个八卦似乎是为修炼步法所用，你"
                          "不妨沿着八卦走(zou)走看。\n" NOR,
        ]) );
        set("exits", ([
                "down" : __DIR__"hh_jianlou1",
                "up" : __DIR__"hh_jianlou3",
        ]));
        setup();
}

void init()
{
        add_action("do_zou", "zou");
}

int do_zou(string arg)
{
        object me;
//      object weapon;
        me = this_player();

        if ( ! living(me)) return 0;

        if ( ! living(this_player()) || arg != "bagua" )
                return notify_fail("你要怎么走？\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");

        if ((int)me->query_skill("lianhuan-mizongtui", 1) < 10)
                return notify_fail("你沿着八卦图走了数圈，但发现似乎没"
                                   "什么效果。\n");

        if ((int)me->query_skill("lianhuan-mizongtui", 1) > 180)
                return notify_fail("你沿着八卦图走了数圈，发现自己的连"
                                   "环迷踪腿已经不能再通过走八卦来提高"
                                   "了。\n");

        if ((int)me->query_skill("unarmed", 1) < (int)me->query_skill("lianhuan-mizongtui", 1))
                return notify_fail("你的基本拳脚水平有限，无法领会更高"
                                   "深的连环迷踪腿。\n");

        if ((int)me->query("qi") < 30)
                return notify_fail("你现在气血翻腾，过于疲倦，还是休息"
                                   "一会吧。\n");

        me->receive_damage("qi", 20);

        if (me->can_improve_skill("lianhuan-mizongtui"))
                me->improve_skill("lianhuan-mizongtui", me->query("dex") * 10);

        me->start_busy(random(2));
        message_vision(HIY "\n$N" HIY "行云流水般的沿着八卦图快速走了一"
                       "圈。\n" NOR, me);
        write(HIC "你对「连环迷踪腿」有了新的理解。\n" NOR);
        return 1;
}