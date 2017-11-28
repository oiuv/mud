#include <ansi.h>
#include <combat.h>

#define CAN "「" RED "残阳劲" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;
 
        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/suqin-beijian/can"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(CAN "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" CAN "。\n");

        if (me->query_skill("force") < 80)
                return notify_fail("你的内功的修为不够，难以施展" CAN "。\n");

        if (me->query_skill("suqin-beijian", 1) < 60)
                return notify_fail("你的苏秦背剑修为不够，难以施展" CAN "。\n");

        if (me->query_skill_mapped("sword") != "suqin-beijian")
                return notify_fail("你没有激发苏秦背剑，难以施展" CAN "。\n");

        if (me->query("neili") < 50)
                return notify_fail("你现在真气不够，难以施展" CAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "伸出两指，注力于" + weapon->name() +
              HIR "剑脊，蓦然回转剑锋，携着全身力道向$n" HIR "划去。\n" NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 3 + random(ap / 2);
                me->add("neili", -30);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 10,
                                           RED "$n" RED "慌忙招架，可已然挡之不及，登"
                                           "时被$N" RED "一剑扫中，鲜血直流！\n" NOR);
        } else
        {
                me->add("neili", -20);
                me->start_busy(3);
                msg += CYN "可是$p" CYN "微微一笑，轻轻格挡开了$P"
                       CYN "的剑招。\n"NOR;
        }

        message_combatd(msg, me, target);

        return 1;
}
