#include <ansi.h>
#include <combat.h>

#define AO "「" HIY "傲尘剑" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;

        if (userp(me) && ! me->query("can_perform/pichen-jian/ao"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(AO "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" AO "。\n");

        if ((int)me->query_skill("pichen-jian", 1) < 100)
                return notify_fail("你辟尘剑法不够娴熟，难以施展" AO "。\n");

        if (me->query_skill_mapped("sword") != "pichen-jian")
                return notify_fail("你没有激发辟尘剑法，难以施展" AO "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你现在的真气不足，难以施展" AO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "一阵狂笑，激得周围尘砂飞扬，手中" + weapon->name() +
              HIY "携着排山倒海之势朝$n" HIY "劈去。\n" NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap / 2);
                me->add("neili", -150);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 35,
                                           HIR "$n" HIR "招架不利，只觉剑光闪过，"
                                           "随觉胸口一阵剧痛，喷出一口鲜血。\n" NOR);
        } else
        {
                me->add("neili", -50);
                me->start_busy(3);
                msg += CYN "可是" CYN "$n" CYN "早有防备，飞身一跃"
                       "而起，避开了$N" CYN "的剑招。\n"NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
