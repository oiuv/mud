// roar.c 鬼哭神嚎

#include <ansi.h>

inherit F_CLEAN_UP;

int exert(object me, object target)
{
	object *ob;
	int i, skill, damage;

	if ((int)me->query("neili") < 100)
		return notify_fail("你的内力不够。\n");

	skill = me->query_skill("force");

	me->add("neili", -100);
	me->receive_damage("qi", 10);

	if (environment(me)->query("no_fight"))
		return notify_fail("这里不能攻击别人! \n");

	me->start_busy(5);
	message_combatd(HIY "$N" HIY "气凝丹田，猛然一声尖啸，犹如鬼哭神嚎"
                        "般，声音激荡刺耳，闻者心驰神摇，肝胆俱裂！\n" NOR, me);

	ob = all_inventory(environment(me));
	for (i = 0; i < sizeof(ob); i++)
        {
		if (! ob[i]->is_character() || ob[i] == me)
			continue;

		if (skill / 2 + random(skill / 2) < (int)ob[i]->query("con") * 2)
			continue;

                me->want_kill(ob[i]);
                me->fight_ob(ob[i]);
                ob[i]->kill_ob(me);
		
		damage = skill - ((int)ob[i]->query("max_neili") / 10);
		if (damage > 0)
                {
                        ob[i]->set("last_damage_from", me);
			ob[i]->receive_damage("qi", damage * 3, me);
			if ((int)ob[i]->query("neili") < skill * 2)
				ob[i]->receive_wound("qi", damage * 2, me);
		        tell_object(ob[i], "你只觉得魔音激荡刺耳，心胆俱裂！顿时，气血上涌，一口鲜血从口中汹涌而出。\n");
		}
	}
	return 1;
}
