#include <ansi.h>
#include <combat.h>

#define TONG "「" HIW "通天彻地" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp, damage;
 
        if (userp(me) && ! me->query("can_perform/lutou-zhang/tong"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(TONG "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "staff")
                return notify_fail("你使用的武器不对，难以施展" TONG "。\n");

        if ((int)me->query_skill("force") < 140)
                return notify_fail("你的内功火候不够，难以施展" TONG "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在的真气不够，难以施展" TONG "。\n");

        if ((int)me->query_skill("lutou-zhang", 1) < 100)
                return notify_fail("你鹿头杖法火候不够，难以施展" TONG "。\n");

        if (me->query_skill_mapped("staff") != "lutou-zhang") 
                return notify_fail("你没有激发鹿头杖法，难以施展" TONG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "\n$N" HIW "一声暴喝，猛然间腾空而起，手中" 
              + weapon->name() + HIW "从天而降，气势惊人地"
              "袭向$n" HIW "。\n" NOR;

        message_sort(msg, me, target);

        ap = me->query_skill("staff");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap / 2);

                msg = COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 55,
                                           HIR "$n" HIR "完全无法看清招中虚实，只"
                                           "听「嘭」地一声，已被$N" HIR "击中肩膀。\n" NOR);
                me->start_busy(3);
                me->add("neili", -180);
        } else 
        {
                msg = CYN "可是$n" CYN "奋力招架，左闪右避，好不容"
                       "易抵挡住了$N" CYN "的攻击。\n" NOR;
                me->start_busy(4);
                me->add("neili", -100);
        }
        message_vision(msg, me, target);

        return 1;
}
