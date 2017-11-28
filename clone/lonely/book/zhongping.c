#include <ansi.h>
 
inherit BOOK;

void create()
{
        set_name(CYN "「中平枪谱」" NOR, ({ "zhongping qiangpu", "zhongping", "qiangpu",
                                            "pu", "book" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("long", CYN "这是一本薄薄的书册，封皮上用正楷写有「中平"
                            "枪法」四个大字。\n" NOR);
                set("value", 1);
                set("no_sell", "…这…这是啥？");
                set("material", "paper");
                set("skill", ([
                        "name" : "zhongping-qiang",
                        "exp_required" : 100000,
                        "jing_cost"  : 100,
                        "difficulty" : 40,
                        "max_skill"  : 149,
                        "min_skill"  : 0
                ]));
        }
}

void init()
{
        add_action("do_yanjiu", "yanjiu");
        add_action("do_yanjiu", "research");
}

int do_yanjiu(string arg)
{
        object me = this_player();
        object where = environment(me);
//      object ob;
        string pfm, book;
//      int lv;

        if (! arg)
        {
                write("研究中平枪谱指令格式：research|yanjiu <绝招> from <中平枪谱>\n");
                return 1;
        }

        if (sscanf(arg, "%s from %s", pfm, book) != 2)
        {
                write("研究中平枪谱指令格式：research|yanjiu <绝招> from <中平枪谱>\n");
                return 1;
        }

        if (me->is_busy())
        {
                write("你现在正忙着呢。\n");
                return 1;
        }

        if (me->is_fighting())
        {
                write("你无法在战斗中专心下来研读新知！\n");
                return 1;
        }

        if (where->query("no_fight") && me->query("doing") != "scheme")
        {
                write("你无法在这里静下心来研读枪谱。\n");
                return 1;
        }

        if (! me->query_skill("literate", 1))
        {
                write("你是个文盲，先学点文化(literate)吧。\n");
                return 1;
        }

        if (! id(book))
        {
                write("你要研究什么？\n");
                return 1;
        }

        if (pfm != "ding")
        {
                write("枪谱上并没有记载你想研究的绝招。\n");
                return 1;
        }

        if ((int)me->query("combat_exp") < 100000)
        {
                write("你的实战经验不足，再怎么读也没用。\n");
                return 1;
        }

        if ((int)me->query("jing") < 100)
        {
                write("你现在过于疲倦，无法专心下来研读新知。\n");
                return 1;
        }

        if (me->query("potential") < me->query("learned_points") + 10) 
        {
                write("你的潜能不够了，研究不出什么。\n");
                return 1;
        }

        // 中平枪法绝招定岳七方
        if (pfm == "ding")
        {
                if ((int)me->query("can_perform/zhongping-qiang/ding"))
                {
                        write("你已经学会了这招，再研究也没用。\n");
                        return 1;
                }

                if (! (int)me->query_skill("zhongping-qiang"))
                {
                        write("你研究了半天，发现枪谱所记载的绝招与你毫无关系。\n");
                        return 1;
                }

                if ((int)me->query_skill("zhongping-qiang", 1) < 120)
                {
                        write("你发现枪谱上记载的绝招过于深奥，一时难以明白。\n");
                        return 1;
                }

                if (random(20) < 18)
                {
                        message_vision(HIR "$N" HIR "仔细的研读枪谱上记载的绝招，似"
                                       "有所悟。\n" NOR, me);
                        tell_object(me, HIY "你对中平枪法有了更深的理解，但尚需进一"
                                       "步的研究。\n" NOR);
                } else
                { 
                        message_vision(HIR "$N" HIR "仔细的研读枪谱上记载的绝招，似"
                                       "有所悟。\n" NOR, me);
                        tell_object(me, HIY "过得良久，陡然间你双目一亮，终于领悟了"
                                        "枪谱中所记载的中平枪法绝技「定岳七方」的奥"
                                        "秘！\n" NOR + HIC "你学会了「定岳七方」。\n" NOR);

                        if (me->can_improve_skill("club"))
                                me->improve_skill("club", 1500000);
                        if (me->can_improve_skill("zhongping-qiang"))
                                me->improve_skill("zhongping-qiang", 1500000);
                        me->improve_skill("martial-cognize", 1500000);
                        me->set("can_perform/zhongping-qiang/ding", 1);
                }
                me->receive_damage("jing", 80);
                me->add("learned_points", 10);
                me->start_busy(2);
                return 1;
        }
}