// xixing-fanshi.c

#include <ansi.h>

inherit F_CLEAN_UP;

int dispel(object me, object ob, int duration)
{
        int n;

        if (me != ob)
        {
                tell_object(ob, "你发觉" + me->name() + "的内力源源涌进，原"
                            "本紊乱的内息更是厉害，眼前登时一黑。\n");
                tell_object(me, "你试图帮助" + ob->name() + "化解异种真气，"
                            "却忽然发现自己的内力源源而逝，不由大惊，连忙住手。\n");
                if (living(ob)) ob->unconcious();
                return -1;
        }

        if (me->query_skill_mapped("force") != "yijinjing")
        {
                tell_object(me, "你觉得异种真气左突右冲，内息"
                            "大乱，根本无法将内力凝聚起来。\n");
                return -1;
        }

        n = me->query_condition("xixing-fanshi") -
            (int)me->query_skill("yijinjing", 1) / 10;
        if (n < 1)
                me->clear_condition("xixing-fanshi");
        else
                me->apply_condition("xixing-fanshi", n);

        tell_object(me, "你默默的运用易筋经神功化解体内的异种真气。\n");

        return 1;
}

int update_condition(object me, int duration)
{
	// int limit;

	if (! living(me) && (me->query("eff_qi") < 20 || me->query("eff_jing") < 10))
  {
    me->set_temp("因为修习吸星大法不慎，内力反噬吐血身亡了");
		me->die();
		return 0;
	} else {
    me->receive_wound("qi", 20);
    me->receive_wound("jing", 10);
    if (me->query("max_neili"))
            me->add("max_neili", -1);
		tell_object(me, HIR "你觉得丹田内息紊乱之极，浑身忽冷忽"
                                "热，四肢百骸内力激荡，几欲晕厥。\n" NOR);
		message("vision", me->name() + "脸色忽青忽红，四肢不住的颤动。\n",
		  environment(me), me);
	}

  if (me->query("max_neili") < 1)
          duration = 1;
	me->apply_condition("xixing-fanshi", duration - 1);
	if (! duration) return 0;
	return 1;
}
