// 唱仙法吼字决

#include <ansi.h>

inherit F_SSERVER;

int perform(object me, object target)
{
//	string msg;
        int neili, damage;
//	int i;

	if (! target ) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
		return notify_fail("唱仙法吼字决只能在战斗中对对手使用。\n");

	if ((int)me->query_skill("shedao-qigong", 1) < 100)
		return notify_fail("你的蛇岛奇功不够娴熟，不会使用唱仙法吼字决。\n");

	if (environment(me)->query("no_fight"))
		return notify_fail("在这里不能攻击他人。\n");

	if ((int)me->query("neili") < 500)
		return notify_fail("你已经精疲力竭，真气不够了。\n");

	neili = me->query("max_neili");

	me->add("neili", -(300 + random(200)));
	me->receive_damage("qi", 10);

	me->start_busy(1 + random(5));

	message_combatd(HIY "$N" HIY "深深地吸一囗气，忽然仰天长啸，高"
                        "声狂叫：不死神龙，唯我不败！\n" NOR, me);

        if (neili / 2 + random(neili / 2) < (int)target->query("max_neili"))
		return notify_fail("敌人的内力不逊于你，伤不了！\n");
		
	damage = (neili - (int)target->query("max_neili")) / 10;
	if (damage > 0)
        {
		target->receive_damage("jing", damage, me);
		target->receive_damage("qi", damage, me);
		target->receive_wound("jing", damage / 8, me);
		target->receive_wound("qi", damage / 8, me);
		message_combatd(HIR "$N" HIR "只觉脑中一阵剧痛，金星乱"
                                "冒，犹如有万条金龙在眼前舞动。\n" NOR, target);
	}
        me->want_kill(target);
        me->kill_ob(target);
	return 1;
}