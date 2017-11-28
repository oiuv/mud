#include <ansi.h>
#include <combat.h>

#define DING "「" HIR "定阳针" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        int damage;
        string msg;

        if (userp(me) && ! me->query("can_perform/quanzhen-jian/ding"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(DING "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" DING "。\n");

        if ((int)me->query_skill("quanzhen-jian", 1) < 100)
                return notify_fail("你全真剑法不够娴熟，难以施展" DING "。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，难以施展" DING "。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你现在内力太弱，难以施展" DING "。\n");

        if (me->query_skill_mapped("sword") != "quanzhen-jian")
                return notify_fail("你没有激发全真剑法，难以施展" DING "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIC "$N" HIC "脚下左弓右箭，神气完足如雷霆五岳，一式「"
              HIR "定阳针" NOR + HIC "」斜斜刺出。\n" NOR;

        me->start_busy(2);
        if (random(me->query_skill("force")) > target->query_skill("force") / 2)
        {
                damage = (int)me->query_skill("quanzhen-jian", 1) +
		         (int)me->query_skill("force", 1) +
			 (int)me->query_skill("xiantian-gong", 1);

                damage = damage / 3 + random(damage / 3);

                me->add("neili", -100);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,
                                           HIR "$n" HIR "看到$N" HIR "这气拔千钧"
                                           "的一击，竟不知如何招架，登时受了重创"
                                           "！\n" NOR);
        } else
        {
                msg += CYN "可是$p" CYN "看破了$P"
                       CYN "的企图，斜跃避开。\n" NOR;
                me->add("neili", -30);
        }
        message_combatd(msg, me, target);

        return 1;
}
