// derive.c

#include <skill.h>

inherit F_CLEAN_UP;

int deriving(object me);
int halt_deriving(object me);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        object where;
        int point;

	seteuid(getuid());
	where = environment(me);
	
	if (where->query("pigging"))
		return notify_fail("你还是专心拱猪吧！\n");

	if (me->is_busy() || me->query_temp("pending/deriving"))
		return notify_fail("你现在正忙着呢。\n");

	if (me->is_fighting())
		return notify_fail("战斗中还是好好的凝神对敌吧。\n");

        if (me->query("combat_exp") < 30000)
                return notify_fail("你的实战经验太浅，还无法领会通过实战获得的心得。\n");

        if (me->query("experience") < me->query("learned_experience") + 60)
                return notify_fail("你现在积累的实战体会还太少。\n");

	if (me->query("qi") < me->query("max_qi") * 7 / 10)
		return notify_fail("你现在没有充足的体力用来吸收实战的心得。\n");

	if ((int)me->query("jing") * 100 / (int)me->query("max_jing") < 70)
		return notify_fail("你现在精神不济，难以抓住实战体会中的秘要！\n");

        if (environment(me)->query("no_fight") &&
            (me->query("doing") != "scheme" || this_player(1)))
                return notify_fail("你无法在这个地方安心吸收通过实战得到的心得。\n");

        if (arg && sscanf(arg, "%d", point) == 1)
        {
                if (me->query("experience") - me->query("learned_experience") < point)
                        return notify_fail("你并没有积累这么多实战体会。\n");

                if (point < 60)
                        return notify_fail("似乎没有必要为吸收这点体会下功夫。\n");
        } else
                point = -1;

	write("你默默的想了想先前一段时间和对手交手时的情形，开始吸收汲取其中的心得。\n");

	me->set_temp("pending/deriving", 1);
        me->set_temp("derived_point", point);
        me->set_short_desc("正在演练招式。");
	message_vision("$N慢慢放开姿势，忽前忽后，手舞足蹈，似乎在思索什么。\n", me);
	me->start_busy(bind((:call_other, __FILE__, "deriving" :), me),
                       bind((:call_other, __FILE__, "halt_deriving" :), me));
	return 1;
}

int deriving(object me)
{
        int improve;
        int cost;

        if (! me->can_improve_skill("martial-cognize"))
        {
                write("你感觉自己的实战经验还有欠缺，还无法"
                      "领会更高境界的武学修养。\n");
                message("vision", me->name() + "轻轻的叹了口气，怔怔"
                        "的发了一会儿的呆。\n", environment(me), ({ me }));
                me->delete_temp("pending/deriving");
                me->set_short_desc(0);
                return 0;
        }

        cost = me->query_skill("martial-cognize", 1) / 10 + 1;
        
        //转世特技诸邪辟易提高汲取速度 by 薪有所属
        if (me->query("special_skill/piyi"))
                cost += cost * 50 / 100;
                
        if (cost + me->query("learned_experience") > me->query("experience"))
                cost = me->query("experience") - me->query("learned_experience");

        // gain martial-cognize & combat_exp, potential
        improve = cost * (1 + random(5 + me->query_skill("martial-cognize", 1) / 10));
        
        //转世特技武星转世提高汲取效果 by 薪有所属
        if (me->query("special_skill/wuxing"))
                improve += improve * 50 / 100;
                 
        if (me->can_improve_skill("martial-cognize"))
                me->improve_skill("martial-cognize", improve);

        if ((int)me->query("total_hatred") > 0 && random(10) == 0)
        {
		me->add("total_hatred", -random(1 + cost));
                if (me->query("total_hatred") < 0)
                        me->set("total_hatred", 0);
        }

        me->add("combat_exp", 1 + random(2));

        if (random(2))
                // not limit by potential limit
                me->add("potential", 1);

        // cost experience
        if (me->add("learned_experience", cost) >= me->query("experience"))
        {
                write("你将实战中获得的体会心得充分的消化吸收了。\n");
                message("vision", me->name() + "微微一笑，看来内心颇为喜悦。\n",
                        environment(me), ({ me }));
                me->delete_temp("pending/deriving");
                me->delete_temp("derived_point");
                me->set_short_desc(0);
                return 0;
        }

        if (me->query_temp("derived_point") > 0)
        {
                if (me->add_temp("derived_point", -cost) < 1)
                {
                        write("你消化吸收了一些实战中获得的体会心得。\n");
                        message("vision", me->name() + "微微一笑，看来内心颇为喜悦。\n",
                                environment(me), ({ me }));
                        me->delete_temp("pending/deriving");
                        me->delete_temp("derived_point");
                        me->set_short_desc(0);
                        return 0;
                }
        }

        switch (random(20))
        {
        case 0:
                write("你凝思良久，对内功方面又有了新的体会。\n");
                break;

        case 1:
                write("你默默思索，对拳脚功夫又想通了一些关节。\n");
                break;

        case 2:
                write("你静心琢磨，对轻身功夫又添了一层理解。\n");
                break;

        case 3:
                write("你总结了见识过的种种兵器功夫，又想通了其中的一些奥秘。\n");
                break;
        }

        return 1;
}

int halt_deriving(object me)
{
        tell_object(me, "你心随意转，收回念头，不再思索武学秘奥。\n");
        tell_room(environment(me), me->name() + "唯一皱眉，收住了姿势。\n", me);
	me->delete_temp("pending/deriving");
        me->set_short_desc(0);
	return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : derive [<点数>]

    这个指令可以让你吸收汲取实战中的体会，当你充分的消化了其
中的秘奥以后，可以提升自己的武学修养。这是一门艰深的学问，是
所有武学的基础，身为一代宗师，武学修养是必不可少的。

HELP );
        return 1;
}
