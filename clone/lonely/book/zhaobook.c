// zhaobook.c

inherit BOOK;
inherit F_UNIQUE;

#include <ansi.h>

void setup()
{}

void create()
{
        set_name(YEL"「破书残章」" NOR, ({ "can zhang","book", }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("material", "paper");
                set("long",
        "这是一本薄薄的小册子，看起来十分的残旧，书中写着一\n"
        "些密密麻麻的小字，不知是用来做什么的。\n", );
		set("skill", ([
			"name"        : "jinzhong-zhao",
			"exp_required":	800000,
			"jing_cost"   :	150,
			"neili_cost"  :	150,
			"difficulty"  :	98,
			"max_skill"   : 180,
			"min_skill"   : 0,
		]));
        }
}

void init()
{

        add_action("do_yanjiu", "yanjiu");
        add_action("do_yanjiu", "research");
}

int do_du(string arg)
{
        object me = this_player();
        object where = environment(me);
        //object ob;

        string skill, book, msg;
        //int lv;

        if (! arg)
        {
                write("研读金钟罩秘笈指令格式：read <技能> from <金钟罩秘笈>\n");
                return 1;
        }

        if (sscanf(arg, "%s from %s", skill, book) != 2)
        {
                write("研读金钟罩秘笈指令格式：read <技能> from <金钟罩秘笈>\n");
                return 1;
        }

        if (me->query("con") < 33)
        {
                write("你的先天根骨太差，没法领悟金钟罩的精髓\n");
                return 1;
        }

        if (me->query("str") < 33)
        {
                write("你的先天臂力太差，没法领悟金钟罩的精髓\n");
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
                write("你无法在这里静下心来研读金钟罩秘笈。\n");
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

        if (skill != "zhao")
        {
                write("金钟罩秘笈上并没有记载你打算研究的内容。\n" NOR);
                return 1;
        }

        if ((int)me->query("combat_exp") < 2000000)
        {
                write("你的实战经验不足，再怎么读也没用。\n");
                return 1;
        }

        if (skill == "zhao")
        {
           if (me->query("can_perform/jinzhong-zhao/zhao"))
           {
                write("你不是已经会了吗？\n");
                return 1;
           }
           if (me->query_skill("jinzhong-zhao", 1) < 150)
           {
                write("你对金钟罩的知识不够纯熟，无法研读此绝招！\n");
                return 1;
           }

           if (random (5) != 1)
           {
                write("你研究了半天，仍然无法将「金钟罩」融会贯通！\n");
                me->start_busy(15);
                me->set("jing", 1);
                return 1;
           }
           msg = HIG "$N" HIG "不停地来回翻看书上的内容，仔细研究上面所记载的武学，霎那间忽有所悟"
                     "……\n" NOR;

           msg += HIG "$N" HIG "猛提真气，仰天长啸一声，一股无形气流瞬间将你包围起来!\n" NOR;
           message_vision(msg, me);

           if (me->can_improve_skill("parry"))
                   me->improve_skill("parry", 1500000);
           if (me->can_improve_skill("jinzhong-zhao"))
                   me->improve_skill("jinzhong-zhao", 1500000);
           if (me->can_improve_skill("martial-cognize"))
                   me->improve_skill("martial-cognize", 1500000);

           write(HIW "你学会了「" HIW "金钟罩" HIW "」。\n" NOR);
           me->set("can_perform/jinzhong-zhao/zhao", 1);

           return 1;
        }
}

int do_yanjiu(string arg)
{
        object me = this_player();
        object where = environment(me);
        //object ob;
        string pfm, canzhang;
       // int lv;

        if (! arg)
        {
                write("研究金钟罩指令格式：research|yanjiu <绝招> from <破书残章>\n");
                return 1;
        }

        if (sscanf(arg, "%s from %s", pfm, canzhang) != 2)
        {
                write("研究金钟罩指令格式：research|yanjiu <绝招> from <破书残章>\n");
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
                write("你无法在这里静下心来研读破书残章。\n");
                return 1;
        }

        if (! me->query_skill("literate", 1))
        {
                write("你是个文盲，先学点文化(literate)吧。\n");
                return 1;
        }

        if (! id(canzhang))
        {
                write("你要研究什么？\n");
                return 1;
        }

        if (pfm != "zhao")
        {
                write("这本书上并没有记载你想研究的绝招。\n");
                return 1;
        }

        if ((int)me->query("combat_exp") < 300000)
        {
                write("你的实战经验不足，再怎么读也没用。\n");
                return 1;
        }

        if (pfm == "zhao")
        {
           if (me->query("can_perform/jinzhong-zhao/zhao"))
           {
                write("你不是已经会了吗？\n");
                return 1;
           }
           if (me->query_skill("jinzhong-zhao", 1) < 150)
           {
                write("你对金钟罩的知识不够纯熟，无法研读此绝招！\n");
                return 1;
           }

           if (random (5) != 1)
           {
                write("你研究了半天，仍然无法将「金钟罩」融会贯通！\n");
                me->start_busy(15);
                me->set("jing", 1);
                return 1;
           }
           message_vision(HIG "$N" HIG "不停地来回翻看书上的内容，仔细研究上面所记载的武学，霎那间忽有所悟"
                     "……\n" NOR,me);

           message_vision(HIG "$N" HIG "猛提真气，仰天长啸一声，一股无形气流瞬间将你包围起来!\n" NOR,me);
//           message_vision(msg, me);

           if (me->can_improve_skill("parry"))
                   me->improve_skill("parry", 1500000);
           if (me->can_improve_skill("jinzhong-zhao"))
                   me->improve_skill("jinzhong-zhao", 1500000);
           if (me->can_improve_skill("martial-cognize"))
                   me->improve_skill("martial-cognize", 1500000);

           write(HIW "你学会了「" HIW "金钟罩" HIW "」。\n" NOR);
           me->set("can_perform/jinzhong-zhao/zhao", 1);

           return 1;
        }
}
