#include <ansi.h> 

inherit ROOM;

void create()
{
	set("short", "书房");
	set("long", @LONG
这里是苗人凤的书房，房间内整整齐齐的堆放着各类书籍。
书房的中央横放着一张案台，案台上摆着几本摊开的书册，旁
边还有未燃尽的蜡烛，似乎苗人凤常在这里挑灯夜读。墙壁上
悬挂着几幅图(tu)画，像是出自苗人凤本人的手笔。
LONG);
	set("exits", ([
  		"north" : __DIR__"miaojia_houting",
	]));
	set("no_clean_up", 0);
        set("item_desc", ([
                "tu" : HIC "\n只见图画中绘着一些正在打斗的小人，似是"
                       "与掌法有关。\n" NOR,
        ]) );
	setup();
}

void init()
{
        add_action("do_think", "think");
        add_action("do_canwu", "canwu");
}

int do_think(string arg)
{
        object me;
//      object weapon;
        me = this_player();

        if ( ! living(me)) return 0;

        if ( ! living(this_player()) || arg != "tu" )
                return notify_fail("你要干什么？\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");

        if ((int)me->query_skill("strike", 1) < 30 ||
           (int)me->query_skill("chongtian-zhang", 1) < 30)
                return notify_fail("你发现图中所记载的掌法过于高深，自"
                                   "己无法领会到任何东西。\n");

        if ((int)me->query_skill("strike", 1) > 149 &&
           (int)me->query_skill("chongtian-zhang", 1) > 149)
                return notify_fail("你发现图中所记载的掌法过于肤浅，自"
                                   "己无法领会到任何东西。\n");

        if ((int)me->query("jing") < 50)
                return notify_fail("你现在精神不济，过于疲倦，还是休息"
                                   "一会吧。\n");

        me->receive_damage("jing", 30);

        if ((int)me->query_skill("strike", 1) < 150 &&
           me->can_improve_skill("strike"))
                me->improve_skill("strike", me->query("int") * 3 / 2);

        if ((int)me->query_skill("chongtian-zhang", 1) < 150 &&
           me->can_improve_skill("chongtian-zhang"))
                me->improve_skill("chongtian-zhang", me->query("int") * 3 / 2);

        me->start_busy(random(2));
        message_vision(HIY "\n$N" HIY "聚精会神的参详图中所记载的掌法，"
                       "似有所悟。\n" NOR, me);
        write(HIC "你对「基本掌法」和「白鹤冲天掌」有了新的领悟。\n" NOR);
        return 1;
}

int do_canwu(string arg)
{
        object me = this_player();
//      object ob;
//      object ob1;

        if (arg != "wall" && arg != "shu")
                return notify_fail("你要参悟什么？\n");

        if ((int)me->query("can_perform/panlong-zhao/tan"))
                return notify_fail(WHT "你随手翻阅案台上的书籍，发现上"
                                   "面已经没什么东西值得研究了。\n" NOR);

        if (! (int)me->query_skill("panlong-zhao"))
                return notify_fail(WHT "你随手翻阅案台上的书籍，发现书"
                                   "中所记载的东西和你所习的武学没什么"
                                   "瓜葛，参悟不出什么。\n" NOR);

        if ((int)me->query_skill("panlong-zhao", 1) < 130)
                return notify_fail(WHT "你随手翻阅案台上的书籍，发现书"
                                   "中所记载的爪法甚是精妙，可却是太过"
                                   "深奥，自己一时无法领悟。\n" NOR);

        if (me->is_busy())
                return notify_fail("你现在正在参悟中。\n");

        if (me->query("potential") < me->query("learned_points") + 10) 
                return notify_fail("你的潜能不够了，参悟不出什么。\n");

        if ((int)me->query("jing") < 30)
                return notify_fail("你太疲倦了，休息一下吧。\n");

        if (random(20) < 18)
        {
                me->receive_damage("jing", 25);
                me->add("learned_points", 10);
                me->start_busy(2);
                message_vision(WHT "$N" WHT "仔细翻看案台上的诸多书籍"
                               "，阅读其中每个细节。\n" NOR, me);
                tell_object(me, HIY "你对越空盘龙爪有了更深的理解，但"
                               "尚需进一步的参悟。\n" NOR);
                return 1;
        } else
        { 
                me->receive_damage("jing", 25);
                me->add("learned_points", 10);
                me->start_busy(2);
                message_vision(WHT "$N" WHT "仔细翻看案台上的诸多书籍"
                               "，阅读其中每个细节。\n" NOR, me);

                tell_object(me, HIY "过得良久，陡然间你双目一亮，终于"
                                "领悟了书中记载越空盘\n龙爪「云中探爪"
                                "」绝技的奥秘！\n" NOR + HIC "你学会了"
                                "「云中探爪」。\n" NOR);
                if (me->can_improve_skill("claw"))
                        me->improve_skill("claw", 1500000);
                if (me->can_improve_skill("claw"))
                        me->improve_skill("claw", 1500000);
                if (me->can_improve_skill("claw"))
                        me->improve_skill("claw", 1500000);
                if (me->can_improve_skill("panlong-zhao"))
                        me->improve_skill("panlong-zhao", 1500000);
                if (me->can_improve_skill("panlong-zhao"))
                        me->improve_skill("panlong-zhao", 1500000);
                if (me->can_improve_skill("panlong-zhao"))
                        me->improve_skill("panlong-zhao", 1500000);
                me->improve_skill("martial-cognize", 1500000);
                me->set("can_perform/panlong-zhao/tan", 1);
        }

        return 1;
}
