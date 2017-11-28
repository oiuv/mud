#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

#define DUO "「" HIC "天诛龙蛟诀" NOR "」"

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;
 
        if (playerp(me) && ! me->query("can_perform/yinlong-bian/zhu"))
                return notify_fail("你使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(DUO "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            weapon->query("skill_type") != "whip")
                return notify_fail("你使用的武器不对。\n");

        if (me->query_skill("force", 1) < 130)
                return notify_fail("你的内功火候不够，使不了" DUO "。\n");

        if (me->query_skill("yinlong-bian", 1) < 100)
                return notify_fail("你的银龙鞭法功力太浅，使不了" DUO "。\n");

        if (me->query("neili") < 300)
                return notify_fail("你的真气不够，无法使用" DUO "。\n");

        if (me->query_skill_mapped("whip") != "yinlong-bian")
                return notify_fail("你没有激发银龙鞭法，使不了" DUO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "诡异的一笑，手中" + weapon->name() +
              HIW "犹如一条银龙猛然飞向$n" HIW "，正是九阴真经中的"
             "绝招「" HIC "天诛龙蛟诀" HIW "」！\n" NOR;

        ap = me->query_skill("whip") + me->query_skill("force");
        dp = target->query_skill("force") + target->query_skill("parry");

        if (ap * 11 / 20 + random(ap) > dp)
        {
                damage = ap + random(ap / 2);
                me->add("neili", -200);
                me->start_busy(2);

                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 85,
                                           HIR "结果$n" HIR "一声惨叫，未能看破$N"
                                           HIR "的企图，被这一鞭硬击在胸口，鲜血飞"
                                           "溅，皮肉绽开！\n" NOR);
                message_combatd(msg, me, target);
                
        } else
        {
                me->add("neili", -100);
                me->start_busy(3);
                msg += CYN "可是$p" CYN "飞身一跃而起，躲避开了"
                       CYN "$P" CYN "的攻击！\n" NOR;
                message_combatd(msg, me, target);
        }

        return 1;
}
