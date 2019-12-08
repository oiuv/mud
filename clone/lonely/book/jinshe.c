// jinshe1.c

inherit BOOK;
inherit F_UNIQUE;

#include <ansi.h>

void setup()
{}

void create()
{
        set_name(YEL"「金蛇秘芨」" NOR , ({ "jinshe book","book", }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("material", "paper");
                set("long",
        "这是一本用薄纸写成的书。上书：「金蛇秘芨」。\n"
        "书皮泛黄，看来已经保存很久了。\n", );
		set("skill", ([
			"name"        : "jinshe-jian",
			"exp_required":	300000,
			"jing_cost"   :	55,
			"difficulty"  :	98,
			"min_skill"   : 120,
			"max_skill"   : 180,
		]));
        }
}

void init()
{
        add_action("do_du", "read");
}

int do_du(string arg)
{
        object me = this_player();
        object where = environment(me);
//      object ob;

        string skill, book, msg;
//      int lv;

        if (! arg)
        {
                write("研读金蛇秘芨指令格式：read <技能> from <金蛇秘芨>\n");
                return 1;
        }

        if (sscanf(arg, "%s from %s", skill, book) != 2)
        {
                write("研读金蛇秘芨指令格式：read <技能> from <金蛇秘芨>\n");
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

        if (where->query("no_fight")
           && me->query("doing") != "scheme")
        {
                write("你无法在这里静下心来研读金蛇秘芨。\n");
                return 1;
        }

        if (! me->query_skill("literate", 1))
        {
                write("你是个文盲，先学点文化(literate)吧。\n");
                return 1;
        }

        if (! id(book))
        {
                write("这里没有这本书。\n");
                return 1;
        }

        if (skill != "蛇困愁城" && skill != "蛇影万道"
           && skill != "金蛇噬天")
        {
                write("金蛇秘芨上并没有记载你打算研究的内容。\n" NOR);
                return 1;
        }

        if ((int)me->query("combat_exp") < 300000)
        {
                write("你的实战经验不足，再怎么读也没用。\n");
                return 1;
        }

        if (skill == "蛇困愁城")
        {
           if (me->query("can_perform/jinshe-jian/kun"))
           {
                write("你不是已经会了吗？\n");
                return 1;
           }
           if (me->query_skill("jinshe-jian", 1) < 140)
           {
                write("你金蛇剑法不够熟练，无法研读此绝招！\n");
                return 1;
           }

           if (random (5) != 1)
           {
                write("你研究了半天，仍然无法将「蛇困愁城」融会贯通！\n");
                me->start_busy(15);
                me->set("jing", 1);
                return 1;
           }
           msg = HIG "$N" HIG "翻看秘芨，仔细研究上面所记载的武学，霎那间忽有所悟"
                     "……\n" NOR;

           msg += HIG "$N" HIG "长叹一声，感慨万千。\n" NOR;
           message_vision(msg, me);

           if (me->can_improve_skill("sword"))
                   me->improve_skill("sword", 1500000);
           if (me->can_improve_skill("jinshe-jian"))
                   me->improve_skill("jinshe-jian", 1500000);
           if (me->can_improve_skill("martial-cognize"))
                   me->improve_skill("martial-cognize", 1500000);

           write(HIW "你学会了「" HIG "蛇困愁城" HIW "」。\n" NOR);
           me->set("can_perform/jinshe-jian/kun", 1);

           return 1;
        }

        else

        if (skill == "蛇影万道")
        {
           if (me->query("can_perform/jinshe-jian/wan"))
           {
                write("你不是已经会了吗？\n");
                return 1;
           }
           if (me->query_skill("jinshe-jian", 1) < 180)
           {
                write("你金蛇剑法不够熟练，无法研读此绝招！\n");
                return 1;
           }

           if (random (8) != 1)
           {
                write("你研究了半天，仍然无法将「蛇影万道」融会贯通！\n");
                me->start_busy(15);
                me->set("jing", 1);
                return 1;
           }
           msg = HIG "$N" HIG "翻看秘芨，仔细研究上面所记载的武学，霎那间忽有所悟"
                     "……\n" NOR;
           msg += HIG "$N" HIG "长叹一声，感慨万千。\n" NOR;

           message_vision(msg, me);

           if (me->can_improve_skill("sword"))
                   me->improve_skill("sword", 1500000);
           if (me->can_improve_skill("jinshe-jian"))
                   me->improve_skill("jinshe-jian", 1500000);
           if (me->can_improve_skill("martial-cognize"))
                   me->improve_skill("martial-cognize", 1500000);

           write(HIW "你学会了「" HIG "蛇影万道" HIW "」。\n" NOR);
           me->set("can_perform/jinshe-jian/wan", 1);

           return 1;
        }

        else

        if (skill == "金蛇噬天")
        {
           if (me->query("can_perform/jinshe-jian/shi"))
           {
                write("你不是已经会了吗？\n");
                return 1;
           }
           if (me->query_skill("jinshe-jian", 1) < 200)
           {
                write("你金蛇剑法不够熟练，无法研读此绝招！\n");
                return 1;
           }

           if (random (10) != 1)
           {
                write("你研究了半天，仍然无法将「金蛇噬天」融会贯通！\n");
                me->start_busy(15);
                me->set("jing", 1);
                return 1;
           }
           msg = HIG "$N" HIG "翻看剑谱，仔细研究上面所记载的武学，霎那间忽有所悟"
                     "……\n" NOR;
           msg += HIG "$N" HIG "长叹一声，感慨万千。\n" NOR;
           message_sort(msg, me);

           if (me->can_improve_skill("sword"))
                   me->improve_skill("sword", 1500000);
           if (me->can_improve_skill("jinshe-jian"))
                   me->improve_skill("jinshe-jian", 1500000);
           if (me->can_improve_skill("martial-cognize"))
                   me->improve_skill("martial-cognize", 1500000);

           write(HIW "你学会了「" HIG "金蛇噬天" HIW "」。\n" NOR);
           me->set("can_perform/jinshe-jian/shi", 1);

           return 1;
        }
}
