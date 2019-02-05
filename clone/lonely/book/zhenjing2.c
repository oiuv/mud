#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(WHT "「九阴真经」下册" NOR, ({ "zhenjing xiace", "xiace", "zhenjing", "jing"}));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("material", "paper");
                set("no_sell", 1);
                set("long", WHT "\n这是一本用薄纸写成的书，封皮上写有「九阴真经」下\n"
                            "册六字。书皮泛黄，看来已经保存很久了。真经中记载\n"
                            "有催心掌、九阴白骨爪和银龙鞭法等绝技，你可以试着\n"
                            "读读(read)看。\n\n" NOR, );
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

        string skill, book;
        int lv;

        if (! arg)
        {
                write("研读九阴真经指令格式：read <技能> from <九阴真经>\n");
                return 1;
        }

        if (sscanf(arg, "%s from %s", skill, book) != 2)
        {
                write("研读九阴真经指令格式：read <技能> from <九阴真经>\n");
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
                write("你无法在这里静下心来研读真经。\n");
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

        if (skill != "jiuyin-baiguzhao" && skill != "九阴白骨爪"
           && skill != "cuixin-zhang" && skill != "催心掌"
           && skill != "yinlong-bian" && skill != "银龙鞭法"
           && skill != "天诛龙蛟诀"
           && skill != "夺命催心"
           && skill != "九阴神爪"
           && skill != "夺命连环爪")
        {
                write("真经上并没有记载你打算研究的内容。\n" NOR);
                return 1;
        }

        if (me->query_skill("sanscrit", 1) < 200)
        {
                write("你的梵文水平太低，无法看懂真经里所记载的内容。\n");
                return 1;
        }

        if ((int)me->query("combat_exp") < 800000)
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

        if (skill == "天诛龙蛟诀")
        {

                if (me->query("can_perform/yinlong-bian/zhu"))
                {
                        write("你不是已经会了吗？\n");
                        return 1;
                }
                if (me->query_skill("yinlong-bian", 1) < 100)
                {
                        write("你银龙鞭法不够熟练，无法领悟该招。\n");
                        return 1;
                }
                tell_object(me, HIG "你学会了「天诛龙蛟诀」。\n" NOR);
                me->receive_damage("jing", 80);
                me->start_busy(2);
                me->set("can_perform/yinlong-bian/zhu", 1);

           	if (me->can_improve_skill("whip"))
                   	me->improve_skill("whip", 1500000);
           	if (me->can_improve_skill("yinlong-bian"))
                   	me->improve_skill("yinlong-bian", 1500000);
           	if (me->can_improve_skill("martial-cognize"))
                   	me->improve_skill("martial-cognize", 1500000);

                return 1;

        }

        else

        if (skill == "夺命催心")
        {

                if (me->query("can_perform/cuixin-zhang/cui"))
                {
                        write("你不是已经会了吗？\n");
                        return 1;
                }
                if (me->query_skill("cuixin-zhang", 1) < 120)
                {
                        write("你催心掌不够熟练，无法领悟该招。\n");
                        return 1;
                }

                tell_object(me, HIG "你学会了「夺命催心」。\n" NOR);
                me->receive_damage("jing", 80);
                me->start_busy(2);
                me->set("can_perform/cuixin-zhang/cui", 1);

           	if (me->can_improve_skill("strike"))
                   	me->improve_skill("strike", 1500000);
           	if (me->can_improve_skill("cuixin-zhang"))
                   	me->improve_skill("cuixin-zhang", 1500000);
           	if (me->can_improve_skill("martial-cognize"))
                   	me->improve_skill("martial-cognize", 1500000);

                return 1;
        }

        else

        if (skill == "九阴神爪")
        {
                if (me->query("can_perform/jiuyin-baiguzhao/zhua"))
                {
                        write("你不是已经会了吗？\n");
                        return 1;
                }
                if (me->query_skill("jiuyin-baiguzhao", 1) < 120)
                {
                        write("你九阴白骨爪不够熟练，无法领悟该招。\n");
                        return 1;
                }

                tell_object(me, HIG "你学会了「九阴神爪」。\n" NOR);
                me->receive_damage("jing", 80);
                me->start_busy(2);
                me->set("can_perform/jiuyin-baiguzhao/zhua", 1);

           	if (me->can_improve_skill("claw"))
                   	me->improve_skill("claw", 1500000);
           	if (me->can_improve_skill("jiuyin-baiguzhao"))
                   	me->improve_skill("jiuyin-baiguzhao", 1500000);
           	if (me->can_improve_skill("martial-cognize"))
                   	me->improve_skill("martial-cognize", 1500000);

                return 1;
        }

        else

        if (skill == "夺命连环爪")
        {
                if (me->query("can_perform/jiuyin-baiguzhao/duo"))
                {
                        write("你不是已经会了吗？\n");
                        return 1;
                }
                if (me->query_skill("jiuyin-baiguzhao", 1) < 140)
                {
                        write("你九阴白骨爪不够熟练，无法领悟该招。\n");
                        return 1;
                }

                tell_object(me, HIG "你学会了「夺命连环爪」。\n" NOR);
                me->receive_damage("jing", 80);
                me->start_busy(2);
                me->set("can_perform/jiuyin-baiguzhao/duo", 1);

           	if (me->can_improve_skill("claw"))
                   	me->improve_skill("claw", 1500000);
           	if (me->can_improve_skill("jiuyin-baiguzhao"))
                   	me->improve_skill("jiuyin-baiguzhao", 1500000);
           	if (me->can_improve_skill("martial-cognize"))
                   	me->improve_skill("martial-cognize", 1500000);

                return 1;
        }

        else

        if (skill == "jiuyin-baiguzhao" || skill == "九阴白骨爪")
                skill = "jiuyin-baiguzhao";
        else

        if (skill == "cuixin-zhang" || skill == "催心掌")
                skill = "cuixin-zhang";
        else

        if (skill == "yinlong-bian" || skill == "银龙鞭法")
                skill = "yinlong-bian";

        if (! SKILL_D(skill)->valid_learn(me))
               	return 0;

        if (! me->can_improve_skill(skill))
       	{
               	write("你的实战经验不足，再怎么读也没用。\n");
               	return 1;
       	}

        lv = me->query_skill(skill, 1);

        if (lv >= 180)
	{
                write("你研读了一会儿，但是发现上面所说的对你而言都太浅了。\n");
                return 1;
        }

        // 天赋聪颖增加研读速度
        if (me->query("special_skill/clever"))
                me->improve_skill(skill, me->query("int") + 11);
        else
                me->improve_skill(skill, me->query("int") + 1);

        me->receive_damage("qi", random(40) + 20);
        me->receive_damage("jing", random(40) + 20);
        me->add("neili", -lv);
        message("vision", me->name() + "正专心地研读九阴真经。\n",
                          environment(me), me);
        write("你仔细研读九阴真经，颇有心得。\n");
        return 1;
}
