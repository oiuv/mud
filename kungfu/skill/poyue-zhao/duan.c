#include <ansi.h>
#include <combat.h>

#define DUAN "「" HIY "断脉破岳" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int i;

        if (userp(me) && ! me->query("can_perform/poyue-zhao/duan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(DUAN "只能对战斗中的对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail(DUAN "只能空手施展。\n");

        if ((int)me->query_skill("poyue-zhao", 1) < 80)
                return notify_fail("你破岳神爪不够娴熟，难以施展" DUAN "。\n");

        if (me->query_skill_mapped("claw") != "poyue-zhao")
                return notify_fail("你没有激发破岳神爪，难以施展" DUAN "。\n");

        if (me->query_skill_prepared("claw") != "poyue-zhao")
                return notify_fail("你没有准备破岳神爪，难以施展" DUAN "。\n");

        // 至于NPC么…这个…还是用互背的好，互背时把CLAW提前就行了。
        if (userp(me) && me->query_skill_prepared("cuff") == "zhenyu-quan")
                return notify_fail("施展" DUAN "时破岳神爪不谊和镇狱拳法互背。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你现在真气不足，难以施展" DUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "霎时间只见$N" HIY "身形一展，双爪疾攻而上，爪影笼罩$n"
              HIY "全身各处要穴。\n" NOR;
        message_combatd(msg, me, target);
        me->add("neili", -50);

        for (i = 0; i < 4; i++)
        {
                if (! me->is_fighting(target))
                        break;
                COMBAT_D->do_attack(me, target, 0, 0);
        }
        me->start_busy(1 + random(4));
        return 1;
}
