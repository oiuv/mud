#include <ansi.h>
#include <combat.h>

#define YING "「" HIR "无影神拳" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp;
        int lvl;

        if (! target) target = offensive_target(me);

        //if (userp(me) && ! me->query("can_perform/shenzhaojing/ying"))
          //      return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(YING "只能对战斗中的对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail("你必须空手才能施展" YING "。\n");

        if (me->query_skill_mapped("unarmed") != "shenzhaojing")
                return notify_fail("你没有激发神照经神功为拳脚，无法施展" YING "。\n");

        if (me->query_skill_prepared("unarmed") != "shenzhaojing")
                return notify_fail("你现在没有准备使用神照经神功，无法施展" YING "。\n");

        if ((int)me->query_skill("shenzhaojing", 1) < 200)
                return notify_fail("你的神照经神功火候不够，无法施展" YING "。\n");

        if ((int)me->query_skill("unarmed", 1) < 200)
                return notify_fail("你的基本拳脚火候不够，无法施展" YING "。\n");

        if ((int)me->query("max_neili") < 5000)
                return notify_fail("你的内力修为不足，无法施展" YING "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你的真气不够，无法施展" YING "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "倏然跃近，无声无影击出一拳，去势快极，拳影重"
              "重叠叠，直袭$n" HIR "而去。\n"NOR;

        lvl = me->query_skill("shenzhaojing", 1);

        ap = me->query_skill("force") + me->query("con") * 5;
        dp = target->query_skill("force") + target->query("con") * 5;

        me->start_busy(3);
        if (ap / 2 + random(ap) > dp)
        { 
                damage = ap + random(ap / 2);
                me->add("neili", -400);
                target->affect_by("shenzhao", ([
                	"level" : me->query("jiali") + random(me->query("jiali")),
                        "id"    : me->query("id"),
                        "duration" : lvl / 50 + random(lvl / 20) ]));
                        msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK,
                               damage, 90, HIR "$n" HIR "见拳势变换莫测，只是"
                               "微微一愣，已被$N" HIR "一拳正中胸口，神照经内"
                               "劲顿\n时便如山洪爆发一般，透体而入。\n" NOR);
        } else
        {
                msg += CYN "$n" CYN "见$N" CYN "来势汹涌，急忙提气跃开。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
