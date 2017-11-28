#include <ansi.h>
#include <combat.h>

#define DIAN "「" HIR "魁星点元" NOR "」"

inherit F_SSERVER;

string final(object me, object target, int damage);

int perform(object me, object target)
{
        object weapon;
        int ap, dp, damage;
        string wn, msg;

        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/baxian-jian/dian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(DIAN "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" DIAN "。\n");

        if (me->query_skill("force") < 150)
                return notify_fail("你的内功的修为不够，难以施展" DIAN "。\n");

        if (me->query_skill("baxian-jian", 1) < 100)
                return notify_fail("你的八仙剑法修为不够，难以施展" DIAN "。\n");

        if (me->query_skill_mapped("sword") != "baxian-jian")
                return notify_fail("你没有激发八仙剑法，难以施展" DIAN "。\n");

        if (me->query("neili") < 250)
                return notify_fail("你现在真气不够，难以施展" DIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wn = weapon->name();

        msg = HIC "$N" HIC "施出「" HIR "魁星点元" HIC "」绝技，手中" + wn +
              HIC "微作龙吟，剑尖迸出一道剑气射向$n" HIC "。\n" NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap * 2 / 3);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 30,
                                           (: final, me, target, damage :));
                me->start_busy(2);
                me->add("neili", -150);
        } else
        {
                msg += CYN "可是$p" CYN "并不慌乱，收敛心神，轻轻格挡开了$P"
                       CYN "的剑招。\n"NOR;
                me->start_busy(3);
                me->add("neili", -60);
        }
        message_combatd(msg, me, target);

        return 1;
}

string final(object me, object target, int damage)
{
        target->add("neili", -damage);

        if (target->query("neili") < 0)
                target->set("neili", 0);

        return  HIR "结果$n" HIR "不慎被$N" HIR "剑尖荡出的"
                "剑气点中劳宫穴，全身真气不禁狂泄而出！\n" NOR;
}
