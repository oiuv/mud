#include <ansi.h>
#include <combat.h>

#define ZHUI "「" HIR "卸甲锥心势" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	int damage;
	string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/hujia-daofa/zhui"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZHUI "只能对战斗中的对手使用。\n");
 
        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对，难以施展" ZHUI "。\n");

        if ((int)me->query_skill("force") < 200)
                return notify_fail("你的内功火候不够，难以施展" ZHUI "。\n");

        if ((int)me->query_skill("hujia-daofa", 1) < 140)
                return notify_fail("你的胡家刀法还不到家，难以施展" ZHUI "。\n");

        if (me->query_skill_mapped("blade") != "hujia-daofa")
                return notify_fail("你没有激发胡家刀法，难以施展" ZHUI "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你的真气不够，难以施展" ZHUI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIR "$N" HIR "手中的" + weapon->name() +  HIR "一振，施出「卸"
              "甲锥心势」，顿时一股凌厉无比的无形刀气破空袭向$n" HIR "！\n"NOR;

        ap = me->query_skill("blade") + me->query_skill("force");
        dp = target->query_skill("force");

        if (ap / 4 + random(ap / 2) > dp)
	{
		damage = ap / 3 + random(ap / 2);
                me->add("neili", -150);
		msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 65,
                                           HIR "只见$n" HIR "一声惨叫，整个人如遭"
                                           "电击，刀气穿心，口中鲜血狂喷而出！\n" NOR);
		me->start_busy(2);
	} else 
	{
		msg += CYN "可是$p" CYN "默运内力，硬是抵挡了$P"
                       CYN "的这记无形刀气。\n"NOR;
                me->add("neili", -50);
		me->start_busy(3);
	}
	message_combatd(msg, me, target);

	return 1;
}
