#include <ansi.h>
#include <combat.h>

#define XING "「" HIY "群星璀璨" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;
 
        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/qixing-jian/xing"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(XING "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" XING "。\n");

        if (me->query_skill("qixing-jian", 1) < 60)
                return notify_fail("你七星剑法修为不够，难以施展" XING "。\n");

        if (me->query_skill_mapped("sword") != "qixing-jian")
                return notify_fail("你没有激发七星剑法，难以施展" XING "。\n");

        if (me->query_skill("force") < 80)
                return notify_fail("你内功的修为不够，难以施展" XING "。\n");

        if (me->query("neili") < 50)
                return notify_fail("你现在的真气不足，难以施展" XING "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "手中" + weapon->name() + HIY "一振，电光火石间"
              "连刺数剑，剑尖闪烁，化作点点繁星罩向$n" HIY "。\n" NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 3 + random(ap / 2);
                me->add("neili", -30);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 10,
                                           HIR "$n" HIR "顿时大吃一惊，格挡不及，"
                                           "登被$N" HIR "剑尖刺中，鲜血四溅！\n" NOR);
        } else
        {
                me->add("neili", -20);
                me->start_busy(3);
                msg += CYN "可是$p" CYN "并不慌乱，轻轻格挡开了$P"
                       CYN "的剑招。\n"NOR;
        }

        message_combatd(msg, me, target);

        return 1;
}
