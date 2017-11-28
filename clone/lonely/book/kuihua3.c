#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
        set_name(HIR "袈裟" NOR, ({ "jia sha", "jia", "sha", "cloth"}));
        set_weight(1500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "件");
                set("long", HIR "一件大红色的粗布袈裟，上面密密麻麻写满了小字。\n" NOR);
                set("value", 1000);
                set("no_sell", 1);
                set("material", "cloth");
                set("armor_prop/armor", 25);
                set("wear_msg", HIR "$N" HIR "展开一件大红色的袈裟披在身上。\n" NOR);
                set("remove_msg", HIR "$N" HIR "将袈裟从身上脱了下来，折叠成小小的一团。\n" NOR);
        }
        setup();
        move("/d/fuzhou/liang");
}

void init()
{
        add_action("do_du", "du");
        add_action("do_du", "study");
        add_action("do_yanjiu", "yanjiu");
        add_action("do_yanjiu", "research");
}

int do_du(string arg)
{
        object me = this_player();
        object where = environment(me);
//      mapping skill;
        int plvl, con/*, improve*/;
        int neili_lost;

        if (! arg || ! id(arg))
                return 0;

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
                write("你无法在这里静下心来研读宝典。\n");
                return 1;
        }

        if (! me->query_skill("literate", 1))
        {
                write("你是个文盲，先学点文化(literate)吧。\n");
                return 1;
        }

        if (me->query("character") == "光明磊落" ||
            me->query("character") == "狡黠多变")
        {
                write("你心中暗道：这辟邪剑法损人损己，修炼来何用。\n");
                return 1;
        }

       //转世特技六阴鬼脉取消研习性别限制 by 薪有所属
        if (! me->query("special_skill/guimai")) 
       {
        if (me->query("gender") == "女性")
        {
                write("自古以来没听说过女人可以修习葵花宝典。\n");
                return 1;
        }

        if (me->query("gender") == "男性")
        {
                me->receive_wound("qi", 50);
                write(HIR "\n你试着修炼辟邪剑法，霎时只觉内息忽然大乱，几"
                      "欲焚身。\n" NOR);
                return 1;
        }
        }

        if (me->query("int") < 34)
        {
                write("你的天资不足，无法理解辟邪剑法的深意。\n");
                return 1;
        }

        if (me->query("dex") < 32)
        {
                write("你先天身法孱弱，难以修炼辟邪剑法。\n");
                return 1;
        }

        if (me->query_skill("sword", 1) < 100)
        {
                write("你的基本剑法造诣太浅，无法理解辟邪剑法。\n");
                return 1;
        }

        if (me->query_skill("dodge", 1) < 100)
        {
                write("你的基本轻功造诣太浅，无法理解辟邪剑法。\n");
                return 1;
        }

        if (me->query_skill("parry", 1) < 100)
        {
                write("你的基本招架造诣太浅，无法理解辟邪剑法。\n");
                return 1;
        }

        if (me->query_skill("sword", 1) < me->query_skill("pixie-jian", 1))
        {
                write("你的基本剑法造诣有限，无法理解更高深的辟邪剑法。\n");
                return 1;
        }

        if (me->query_skill("dodge", 1) < me->query_skill("pixie-jian", 1))
        {
                write("你的基本轻功造诣有限，无法理解更高深的辟邪剑法。\n");
                return 1;
        }

        if (me->query_skill("parry", 1) < me->query_skill("pixie-jian", 1))
        {
                write("你的基本招架造诣有限，无法理解更高深的辟邪剑法。\n");
                return 1;
        }

        if (me->query_skill("unarmed", 1) < me->query_skill("pixie-jian", 1))
        {
                return notify_fail("你的基本拳脚造诣有限，无法理解更高深的辟邪剑法。\n");
                return 1;
        }

        if (me->query_skill("pixie-jian", 1) >= 180)
        {
                write("袈裟上面记载的东西对你来说已经太过浅显了。\n");
                return 1;
        }

        if ((int)me->query("combat_exp") < 300000)
        {
                write("你的实战经验不足，再怎么读也没用。\n");
                return 1;
        }

        if ((int)me->query("max_neili") < 500)
        {
                write("你的内力太差，无法修炼此等神功。\n");
                return 1;
        }

        switch (random(3))
        {
        case 0:
                message("vision", CYN "只见" + me->name() + CYN "偷偷"
                        "摸摸地正在研读一件袈裟。\n" NOR,
                        environment(me), me);
                break;
        case 1:
                message("vision", CYN + me->name() + CYN "照着一件袈裟"
                        "骚首弄姿，好象在模仿女人。\n" NOR,
                        environment(me), me);
                break;
        case 2:
                message("vision", CYN + me->name() + CYN "边读袈裟边把"
                        "腰身扭来扭去，甚为诡异。\n" NOR,
                        environment(me), me);
                break;
        }

        if ((int)me->query("jing") < 60)
        {
                write("你现在过于疲倦，无法专心下来研读新知。\n");
                return 1;
        }

        plvl = me->query_skill("pixie-jian", 1);
        if (plvl > 170) neili_lost = 120; else
        if (plvl > 150) neili_lost = 100; else
        if (plvl > 130) neili_lost = 90; else
        if (plvl > 110) neili_lost = 80; else
        if (plvl > 100) neili_lost = 70; else
        if (plvl > 90)  neili_lost = 60; else
        if (plvl > 80)  neili_lost = 50; else
        if (plvl > 70)  neili_lost = 40; else
        if (plvl > 60)  neili_lost = 30; else
        if (plvl > 50)  neili_lost = 20; else
                        neili_lost = 10;

        con = me->query_con();

        if ((int)me->query("neili") < neili_lost)
        {
                write("你内力不够，无法钻研这么高深的武功。\n");
                return 1;
        }

        if (! me->can_improve_skill("pixie-jian", 1))
        {
                write("你的实战经验不足，再怎么读也没用。\n");
                return 1;
        }

        if ((plvl > 10) && (con / 2 + random(con) < 50) && random(100) == 1)
        {
                // 转世特技六阴鬼脉读《葵花宝典》降低走火入魔机率 by 薪有所属
                if (me->query("special_skill/guimai") && random(4))
                {
                        tell_object(me, HIR "你依照着宝典所示运转内息，突"
                                        "然内息逆流而上，却不觉得有任何不"
                                        "妥。\n" NOR);
                }
                else
                {                
                        tell_object(me, HIR "你依照着宝典所示运转内息，突"
                                        "然只觉内息逆流而上，四肢冰凉，心火如\n"
                                        "焚，惨嚎一声，晕了过去。\n" NOR);
                        message("vision", HIR + me->name() + "突然惨"
                                          "嚎一声，晕了过去。\n" NOR,
                                environment(me), ({ me }));
        
                        if ((int)me->query("max_neili") > 10)
                        {
                                me->add("max_neili", -10 - random(10));
                        }
        
                        me->unconcious();
                        return 1;
                }
        }

        me->receive_damage("jing", random(30) + 30);
        me->add("neili", -neili_lost);

        // 天赋聪颖增加研读速度
        if (me->query("special_skill/clever"))
                me->improve_skill("pixie-jian", me->query("int") + 11);
        else
                me->improve_skill("pixie-jian", me->query("int") + 1);

        me->start_busy(random(1) + 1);
        write(HIR "你仔细研读袈裟上记载的神功，颇有心得。\n" NOR);
        return 1;
}

int do_yanjiu(string arg)
{
        object me = this_player();
        object where = environment(me);
//      object ob;
        string pfm, jiasha;
//      int lv;

        if (! arg)
        {
                write("研究葵花宝典指令格式：research|yanjiu <绝招> from <葵花宝典>\n");
                return 1;
        }

        if (sscanf(arg, "%s from %s", pfm, jiasha) != 2)
        {
                write("研究葵花宝典指令格式：research|yanjiu <绝招> from <葵花宝典>\n");
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
                write("你无法在这里静下心来研读宝典。\n");
                return 1;
        }

        if (! me->query_skill("literate", 1))
        {
                write("你是个文盲，先学点文化(literate)吧。\n");
                return 1;
        }

        if (! id(jiasha))
        {
                write("你要研究什么？\n");
                return 1;
        }

        if (pfm != "gui" && pfm != "duo" && pfm != "pi" && pfm != "po")
        {
                write("袈裟上并没有记载你想研究的绝招。\n");
                return 1;
        }

        if ((int)me->query("combat_exp") < 300000)
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

        // 辟邪剑法绝招夺目神剑
        if (pfm == "duo")
	{
	        if ((int)me->query("can_perform/pixie-jian/duo"))
	        {
        	        write("你已经学会了这招，再研究也没用。\n");
                	return 1;
	        }

	        if (! (int)me->query_skill("pixie-jian"))
	        {
        	        write("你研究了半天，发现袈裟所记载的绝招与你毫无关系。\n");
                	return 1;
	        }

        	if ((int)me->query_skill("pixie-jian", 1) < 80)
	        {
        	        write("你发现袈裟上记载的绝招过于深奥，一时难以明白。\n");
                	return 1;
	        }

        	if (random(20) < 18)
        	{
                	message_vision(HIR "$N" HIR "仔细的研读袈裟上记载的绝招，似"
                                       "有所悟。\n" NOR, me);
                	tell_object(me, HIY "你对辟邪剑法有了更深的理解，但尚需进一"
                                       "步的研究。\n" NOR);
        	} else
        	{ 
                	message_vision(HIR "$N" HIR "仔细的研读袈裟上记载的绝招，似"
                                       "有所悟。\n" NOR, me);
	                tell_object(me, HIY "过得良久，陡然间你双目一亮，终于领悟了"
                                        "袈裟中所记载的辟邪剑法绝技「夺目神剑」的奥"
                                        "秘！\n" NOR + HIC "你学会了「夺目神剑」。\n" NOR);

	                if (me->can_improve_skill("sword"))
        	                me->improve_skill("sword", 1500000);
	                if (me->can_improve_skill("dodge"))
        	                me->improve_skill("dodge", 1500000);
	                if (me->can_improve_skill("parry"))
        	                me->improve_skill("parry", 1500000);
                	if (me->can_improve_skill("pixie-jian"))
                        	me->improve_skill("pixie-jian", 1500000);
              		me->improve_skill("martial-cognize", 1500000);
                	me->set("can_perform/pixie-jian/duo", 1);
        	}
               	me->receive_damage("jing", 80);
               	me->add("learned_points", 10);
               	me->start_busy(2);
                return 1;
	}

        // 辟邪剑法绝招鬼魅身法
        if (pfm == "gui")
	{
	        if ((int)me->query("can_perform/pixie-jian/gui"))
	        {
        	        write("你已经学会了这招，再研究也没用。\n");
                	return 1;
	        }

	        if (! (int)me->query_skill("pixie-jian"))
	        {
        	        write("你研究了半天，发现袈裟所记载的绝招与你毫无关系。\n");
                	return 1;
	        }

        	if ((int)me->query_skill("pixie-jian", 1) < 100)
	        {
        	        write("你发现袈裟上记载的绝招过于深奥，一时难以明白。\n");
                	return 1;
	        }

        	if (random(30) < 28)
        	{
                	message_vision(HIR "$N" HIR "仔细的研读袈裟上记载的绝招，似"
                                       "有所悟。\n" NOR, me);
                	tell_object(me, HIY "你对辟邪剑法有了更深的理解，但尚需进一"
                                       "步的研究。\n" NOR);
        	} else
        	{ 
                	message_vision(HIR "$N" HIR "仔细的研读袈裟上记载的绝招，似"
                                       "有所悟。\n" NOR, me);
	                tell_object(me, HIY "过得良久，陡然间你双目一亮，终于领悟了"
                                        "袈裟中所记载的辟邪剑法绝技「鬼魅身法」的奥"
                                        "秘！\n" NOR + HIC "你学会了「鬼魅身法」。\n" NOR);

	                if (me->can_improve_skill("sword"))
        	                me->improve_skill("sword", 1500000);
	                if (me->can_improve_skill("dodge"))
        	                me->improve_skill("dodge", 1500000);
	                if (me->can_improve_skill("parry"))
        	                me->improve_skill("parry", 1500000);
                	if (me->can_improve_skill("pixie-jian"))
                        	me->improve_skill("pixie-jian", 1500000);
              		me->improve_skill("martial-cognize", 1500000);
                	me->set("can_perform/pixie-jian/gui", 1);
        	}
               	me->receive_damage("jing", 80);
               	me->add("learned_points", 10);
               	me->start_busy(2);
                return 1;
	}

        // 辟邪剑法绝招群邪辟易
        if (pfm == "pi")
	{
	        if ((int)me->query("can_perform/pixie-jian/pi"))
	        {
        	        write("你已经学会了这招，再研究也没用。\n");
                	return 1;
	        }

	        if (! (int)me->query_skill("pixie-jian"))
	        {
        	        write("你研究了半天，发现袈裟所记载的绝招与你毫无关系。\n");
                	return 1;
	        }

        	if ((int)me->query_skill("pixie-jian", 1) < 120)
	        {
        	        write("你发现袈裟上记载的绝招过于深奥，一时难以明白。\n");
                	return 1;
	        }

        	if (random(40) < 38)
        	{
                	message_vision(HIR "$N" HIR "仔细的研读袈裟上记载的绝招，似"
                                       "有所悟。\n" NOR, me);
                	tell_object(me, HIY "你对辟邪剑法有了更深的理解，但尚需进一"
                                       "步的研究。\n" NOR);
        	} else
        	{ 
                	message_vision(HIR "$N" HIR "仔细的研读袈裟上记载的绝招，似"
                                       "有所悟。\n" NOR, me);
	                tell_object(me, HIY "过得良久，陡然间你双目一亮，终于领悟了"
                                        "袈裟中所记载的辟邪剑法绝技「群邪辟易」的奥"
                                        "秘！\n" NOR + HIC "你学会了「群邪辟易」。\n" NOR);

	                if (me->can_improve_skill("sword"))
        	                me->improve_skill("sword", 1500000);
	                if (me->can_improve_skill("dodge"))
        	                me->improve_skill("dodge", 1500000);
	                if (me->can_improve_skill("parry"))
        	                me->improve_skill("parry", 1500000);
                	if (me->can_improve_skill("pixie-jian"))
                        	me->improve_skill("pixie-jian", 1500000);
              		me->improve_skill("martial-cognize", 1500000);
                	me->set("can_perform/pixie-jian/pi", 1);
        	}
               	me->receive_damage("jing", 80);
               	me->add("learned_points", 10);
               	me->start_busy(2);
                return 1;
	}

        // 辟邪剑法绝招破元神剑
        if (pfm == "po")
	{
	        if ((int)me->query("can_perform/pixie-jian/po"))
	        {
        	        write("你已经学会了这招，再研究也没用。\n");
                	return 1;
	        }

	        if (! (int)me->query_skill("pixie-jian"))
	        {
        	        write("你研究了半天，发现袈裟所记载的绝招与你毫无关系。\n");
                	return 1;
	        }

        	if ((int)me->query_skill("pixie-jian", 1) < 180)
	        {
        	        write("你发现袈裟上记载的绝招过于深奥，一时难以明白。\n");
                	return 1;
	        }

        	if (random(50) < 48)
        	{
                	message_vision(HIR "$N" HIR "仔细的研读袈裟上记载的绝招，似"
                                       "有所悟。\n" NOR, me);
                	tell_object(me, HIY "你对辟邪剑法有了更深的理解，但尚需进一"
                                       "步的研究。\n" NOR);
        	} else
        	{ 
                	message_vision(HIR "$N" HIR "仔细的研读袈裟上记载的绝招，似"
                                       "有所悟。\n" NOR, me);
	                tell_object(me, HIY "过得良久，陡然间你双目一亮，终于领悟了"
                                        "袈裟中所记载的辟邪剑法绝技「破元神剑」的奥"
                                        "秘！\n" NOR + HIC "你学会了「破元神剑」。\n" NOR);

	                if (me->can_improve_skill("sword"))
        	                me->improve_skill("sword", 1500000);
	                if (me->can_improve_skill("dodge"))
        	                me->improve_skill("dodge", 1500000);
	                if (me->can_improve_skill("parry"))
        	                me->improve_skill("parry", 1500000);
                	if (me->can_improve_skill("pixie-jian"))
                        	me->improve_skill("pixie-jian", 1500000);
              		me->improve_skill("martial-cognize", 1500000);
                	me->set("can_perform/pixie-jian/po", 1);
        	}
               	me->receive_damage("jing", 80);
               	me->add("learned_points", 10);
               	me->start_busy(2);
                return 1;
	}
}