#include <ansi.h>
#include <combat.h>

#define GUI "「" HIY "天地归元" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
	int ap, dp;
        int damage;

        if (userp(me) && ! me->query("can_perform/yuanshi-jian/gui"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
                return notify_fail(GUI "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" GUI "。\n");

	if ((int)me->query_skill("yuanshi-jian", 1) < 140)
		return notify_fail("你的原始剑法不够娴熟，难以施展" GUI "。\n");

	if (me->query("neili") < 400)
		return notify_fail("你的真气不够，难以施展" GUI "。\n");

        if (me->query_skill_mapped("sword") != "yuanshi-jian")
                return notify_fail("你没有激发原始剑法，难以施展" GUI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "运转内劲，手中" + weapon->name() + HIY "顿时青光闪"
              "烁，出剑嗤然有声，朝$n" HIY "电射而去！\n" NOR;

	ap = me->query_skill("sword");
	dp = target->query_skill("force");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2;
                damage = damage + random(damage);

                me->add("neili", -250);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 65,
                                           HIR "只见$N" HIR + weapon->name() + HIR
                                           "剑芒暴长，$p" HIR "霎时只觉一股热流穿"
                                           "心而过，呕出一口鲜血。\n" NOR);
                me->start_busy(2);
        } else 
        {
                msg += CYN "可是$n" CYN "猛地向前一跃，跳出了$N"
                       CYN "的攻击范围。\n"NOR;
                me->add("neili", -100);
                me->start_busy(3);
        }
        message_combatd(msg, me, target);

        return 1;
}
