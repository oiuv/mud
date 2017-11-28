// roar.c 黯然吟

#include <ansi.h>

inherit F_CLEAN_UP;

int exert(object me, object target)
{
	object *ob;
	int i, skill, damage;

        if (me->query_skill("surge-force", 1) < 100)
                return notify_fail("你黯然一声长叹，结果吓跑了几只老鼠！\n");

	if ((int)me->query("neili") < 100)
		return notify_fail("你的内力不够。\n");

	if (environment(me)->query("no_fight"))
		return notify_fail("这里不能攻击别人! \n");

	skill = me->query_skill("force");

	me->add("neili", -100);
	me->receive_damage("qi", 10);

	me->start_busy(5);
	message_combatd(HIR "$N" HIR "仰天长啸，声浪一波一波的荡开"
                        "去，令人发耳欲聩，意乱情迷！\n" NOR, me);

	ob = all_inventory(environment(me));
	for (i = 0; i < sizeof(ob); i++)
        {
		if (! ob[i]->is_character() || ob[i] == me)
			continue;

		if (skill / 2 + random(skill / 2) < (int)ob[i]->query("con") * 2)
			continue;

                if ((int)ob[i]->query_condition("die_guard"))
                        continue;

                me->want_kill(ob[i]);
                me->fight_ob(ob[i]);
                ob[i]->kill_ob(me);
		
		damage = skill - ((int)ob[i]->query("max_neili") / 10);
		if (damage > 0)
                {
			ob[i]->receive_damage("jing", damage * 2, me);
			if ((int)ob[i]->query("neili") < skill * 2)
				ob[i]->receive_wound("jing", damage, me);
		        tell_object(ob[i], "你听了脑子轰的一下......\n");
		}
	}
	return 1;
}
