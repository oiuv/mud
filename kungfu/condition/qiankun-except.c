// qiankun-except.c

#include <ansi.h>

inherit F_CLEAN_UP;

int dispel(object me, object ob, int duration)
{
        int n;

        if (me != ob)
        {
                tell_object(ob, "你发觉" + me->name() + "的内力自奇经八脉涌入，一时"
                            "间丹田之中内息交战，眼前登时一黑。\n");
                tell_object(me, "你试图帮助" + ob->name() + "化解异种真气，"
                            "却见" + ob->name() + "脸色惨白，不由大惊，连忙住手。\n");
                if (living(ob)) ob->unconcious();
                return -1;
        }

        if (me->query_skill_mapped("force") != "jiuyang-shengong")
        {
                tell_object(me, HIW "你只觉得丹田犹如寒冰，一运内力"
                            "就觉得如同千百根钢针一齐攒刺。\n" NOR);
                return -1;
        }

        if (me->query_skill("jiuyang-shengong", 1) + 30 < duration)
        {
                tell_object(me, "你试图运用九阳神功化解这股"
                            "阴寒之气，但是总是功亏一篑。\n");
                return -1;
        }

        n = me->query_condition("qiankun-except") -
            (int)me->query_skill("jiuyang-shengong", 1) / 10;
        if (n < 1)
                me->clear_condition("qiankun-except");
        else
                me->apply_condition("qiankun-except", n);

        tell_object(me, "你默默的运用九阳神功化解体内的异种真气。\n");

        return 1;
}

int update_condition(object me, int duration)
{
	int limit;

	if (! living(me) && (me->query("eff_qi") < 100 || me->query("eff_jing") < 50))
        {
                me->set_temp("die_reason", "因为强自修炼乾坤大挪移神功，走火入魔而死");
		me->die();
		return 0;
	} else
        {
                me->receive_wound("qi", 100);
                me->receive_wound("jing", 50);
		tell_object(me, HIR "你觉得丹田阵阵寒冷，可是脸上却"
                            "好像发烧一样火热之极。\n" NOR);
		message("vision", me->name() + "脸色忽青忽红，强忍着运功抗争。\n",
			environment(me), me);
	}

	return 1;
}
