#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIW "「六脉神剑谱」" NOR, ({ "liumai jianpu", "liumai", "jianpu"}));
        set_weight(500);
        if (clonep())
               destruct(this_object());
        else {
                set("unit", "本");
                set("material", "paper");
                set("no_sell", 1);
                set("long", HIW "\n这是一本用薄纸写成的书，封皮上写有「六脉神"
                            "剑谱」四\n字。你可以试着读读(read)看。\n\n" NOR, );
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
        int lv;

        if (! arg)
        {
                write("研读六脉神剑谱指令格式：read <技能> from <六脉神剑谱>\n");
                return 1;
        }

        if (sscanf(arg, "%s from %s", skill, book) != 2)
        {
                write("研读六脉神剑谱指令格式：read <技能> from <六脉神剑谱>\n");
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
                write("你无法在这里静下心来研读六脉神剑谱。\n");
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

        if (skill != "shaochong-sword" && skill != "少冲剑"
           && skill != "guanchong-sword" && skill != "关冲剑"
           && skill != "shaoze-sword" && skill != "少泽剑"
           && skill != "zhongchong-sword" && skill != "中冲剑"
           && skill != "shangyang-sword" && skill != "商阳剑"
           && skill != "shaoshang-sword" && skill != "少商剑"
           && skill != "无形剑气" && skill != "六脉剑气"
           && skill != "万剑纵横")
        {
                write("六脉神剑谱上并没有记载你打算研究的内容。\n" NOR);
                return 1;
        }

        if ((int)me->query("combat_exp") < 1000000)
        {
                write("你的实战经验不足，再怎么读也没用。\n");
                return 1;
        }

        if ((int)me->query("jing") < 100
           || (int)me->query("qi") < 100
           || (int)me->query("neili") < 200)
        {
                write("你现在过于疲倦，无法专心下来研读新知。\n");
                return 1;
        }

        if (skill == "无形剑气")
        {
           if (me->query("can_perform/liumai-shenjian/qi"))
           {
                write("你不是已经会了吗？\n");
                return 1;
           }
           if (me->query_skill("liumai-shenjian", 1) < 185)
           {
                write("你六脉神剑不够熟练，无法研读此绝招！\n");
                return 1;
           }

           if (random (10) != 1)
           {
                write("你研究了半天，仍然无法将「无形剑气」融会贯通！\n");
                me->start_busy(15);
                me->set("jing", 1);
                return 1;
           }
           msg = HIG "$N" HIG "翻看剑谱，仔细研究上面所记载的武学，霎那间忽有所悟"
                     "……\n" NOR;
           msg += HIG "$N" HIG "中指一按，一股凌厉无伦的无形剑气直奔天际。\n" NOR;
           msg += HIG "$N" HIG "长叹一声，感慨万千，将内力收回丹田。\n" NOR;
           message_vision(msg, me);

           if (me->can_improve_skill("finger"))
                   me->improve_skill("finger", 1500000);
           if (me->can_improve_skill("liumai-shenjian"))
                   me->improve_skill("liumai-shenjian", 1500000);
           if (me->can_improve_skill("martial-cognize"))
                   me->improve_skill("martial-cognize", 1500000);

           write(HIW "你学会了「" HIG "无形剑气" HIW "」。\n" NOR);
           me->set("can_perform/liumai-shenjian/qi", 1);
           destruct(this_object());
           return 1;
        }

        else

        if (skill == "六脉剑气")
        {
           if (me->query("can_perform/liumai-shenjian/six"))
           {
                write("你不是已经会了吗？\n");
                return 1;
           }
           if (me->query_skill("liumai-shenjian", 1) < 220)
           {
                write("你六脉神剑不够熟练，无法研读此绝招！\n");
                return 1;
           }

           if (random (18) != 1)
           {
                write("你研究了半天，仍然无法将「六脉剑气」融会贯通！\n");
                me->start_busy(15);
                me->set("jing", 1);
                return 1;
           }
           msg = HIG "$N" HIG "翻看剑谱，仔细研究上面所记载的武学，霎那间忽有所悟"
                     "……\n" NOR;
           msg += HIW "$N" HIW "摊开双手，手指连弹，霎时间空气炙热，几"
                  "欲沸腾，六道剑气分自六穴，一起冲向天际" HIW "！\n" NOR;
           msg += HIG "$N" HIG "长叹一声，感慨万千，将内力收回丹田。\n" NOR;
           message_vision(msg, me);

           if (me->can_improve_skill("finger"))
                   me->improve_skill("finger", 1500000);
           if (me->can_improve_skill("liumai-shenjian"))
                   me->improve_skill("liumai-shenjian", 1500000);
           if (me->can_improve_skill("martial-cognize"))
                   me->improve_skill("martial-cognize", 1500000);

           write(HIW "你学会了「" HIG "六脉剑气" HIW "」。\n" NOR);
           me->set("can_perform/liumai-shenjian/six", 1);
           destruct(this_object());
           return 1;
        }

        else

        if (skill == "万剑纵横")
        {
           if (me->query("can_perform/liumai-shenjian/zong"))
           {
                write("你不是已经会了吗？\n");
                return 1;
           }
           if (me->query_skill("liumai-shenjian", 1) < 240)
           {
                write("你六脉神剑不够熟练，无法研读此绝招！\n");
                return 1;
           }
           if (me->query_skill("force", 1) < 340)
           {
                write("你内功火候不够，无法研读此绝招！\n");
                return 1;
           }

           if (random (50) != 1)
           {
                write("你研究了半天，仍然无法将「万剑纵横」融会贯通！\n");
                me->start_busy(15);
                me->set("jing", 1);
                return 1;
           }
           msg = HIG "$N" HIG "翻看剑谱，仔细研究上面所记载的武学，霎那间忽有所悟"
                     "……\n" NOR;
           msg += HIM "$N" HIM "一声清啸，十指纷弹，顿觉六脉剑谱已涌上心头，此起"
                  "彼伏、连绵不绝。霎时剑气如奔，连绵无尽的万道剑气豁然贯向虚空" HIM
                  "！\n" NOR;
           msg += HIG "$N" HIG "长叹一声，感慨万千，将内力收回丹田。\n" NOR;
           message_sort(msg, me);

           if (me->can_improve_skill("finger"))
                   me->improve_skill("finger", 1500000);
           if (me->can_improve_skill("liumai-shenjian"))
                   me->improve_skill("liumai-shenjian", 1500000);
           if (me->can_improve_skill("martial-cognize"))
                   me->improve_skill("martial-cognize", 1500000);

           write(HIW "你学会了「" HIG "万剑纵横" HIW "」。\n" NOR);
           me->set("can_perform/liumai-shenjian/zong", 1);
           destruct(this_object());
           return 1;
        }

        else

        if (me->query_skill("liumai-shenjian", 1))
        {
             write("你不是已经会六脉神剑了吗？还学这干什么？\n");
             return 1;
        }

        else

        if (skill == "shaochong-sword" || skill == "少冲剑")
		skill = "shaochong-sword";
        else

        if (skill == "shaoze-sword" || skill == "少泽剑")
		skill = "shaoze-sword";
        else

        if (skill == "shaoshang-sword" || skill == "少商剑")
		skill = "shaoshang-sword";
        else

        if (skill == "zhongchong-sword" || skill == "中冲剑")
		skill = "zhongchong-sword";
        else

        if (skill == "guanchong-sword" || skill == "关冲剑")
		skill = "guanchong-sword";
        else

        if (skill == "shangyang" || skill == "商阳剑")
		skill = "shangyang-sword";

        if (! SKILL_D(skill)->valid_learn(me))
               	return 0;

        if (! me->can_improve_skill(skill))
       	{
               	write("你的实战经验不足，再怎么读也没用。\n");
               	return 1;
       	}

        lv = me->query_skill(skill, 1);

        if (lv >= 1)
	{
                write("你研读了一会儿，但是发现上面所说的实在有限。\n");
                return 1;
        }

        // 天赋聪颖增加研读速度
        if (me->query("special_skill/clever"))
                me->improve_skill(skill, me->query("int") + 11);
        else
                me->improve_skill(skill, me->query("int") + 1);

        me->receive_damage("qi", random(50) + 30);
        me->receive_damage("jing", random(50) + 30);
        me->add("neili", -lv);
        message("vision", me->name() + "正专心地研读六脉神剑谱。\n",
                          environment(me), me);
        write("你仔细研读六脉神剑谱，颇有心得。\n");
        destruct(this_object());
        return 1;
}
