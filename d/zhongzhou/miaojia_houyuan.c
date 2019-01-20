#include <ansi.h> 
inherit ROOM;

void create()
{
	set("short", "后院");
	set("long", @LONG
你走进后院，迎面是一个大花园，很是美观。池中立着块
巨大无比的假山 (jiashan)。水池的两旁种满了花草，郁郁葱
葱，树木枝叶茂密，遮盖了大半个院子。南边一条长长的木制
长廊，通往苗家的后厅。
LONG);
	set("exits", ([
  		"south" : __DIR__"miaojia_zoulang2",
	]));

        set("item_desc", ([
                "jiashan" : WHT "\n你发现假山背面光滑无比，似"
                            "乎还刻有什么文字。\n" NOR,
        ]));

        set("no_clean_up", 0);
        setup();
}

void init()
{
        add_action("do_think", "think");
}

int do_think(string arg)
{
        object me;
//      object weapon;
        me = this_player();

        if (! living(me)) return 0;

        if (! living(this_player()) || arg != "jiashan")
                return notify_fail("你要参悟什么？\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");

        if ((int)me->query_skill("miaojia-neigong", 1) < 1)
                return notify_fail("你发现假山上所记载的东西与自己所学"
                                   "毫无干系，看不出究竟。\n");

        if ((int)me->query_skill("miaojia-neigong", 1) < 100)
                return notify_fail("你发现假山上所记载的内功心法过于深"
                                   "奥，自己全然无法看懂。\n");

        if ((int)me->query_skill("miaojia-neigong", 1) > 180)
                return notify_fail("你发现假山上所记载的内功心法过于肤"
                                   "浅，对自己已毫无帮助。\n");

        if (! me->can_improve_skill("miaojia-neigong"))
                return notify_fail("可能是实战经验不足的缘故，你再难以"
                                   "领会假山上记载的内容。\n");

        if ((int)me->query("jing") < 80)
                return notify_fail("你现在精神不济，过于疲倦，还是休息"
                                   "一会吧。\n");

        me->receive_damage("jing", 60);

        if (me->can_improve_skill("miaojia-neigong"))
	{
                // 天赋聪颖增加研读速度
                if (me->query("special_skill/clever"))
                	me->improve_skill("miaojia-neigong", me->query("int") + 9);
                else
                        me->improve_skill("miaojia-neigong", me->query("int"));
        }

        me->start_busy(random(2));
        message_vision(HIY "\n$N" HIY "聚精会神的参详假山上所记载的心法，"
                       "似有所悟。\n" NOR, me);
        write(HIC "你对「苗家内功」有了新的领悟。\n" NOR);
        return 1;
}