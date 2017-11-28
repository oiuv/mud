#include <ansi.h>
#include <combat.h>

#define SHENG "「" HIW "天升剑诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int i;

        if (userp(me) && ! me->query("can_perform/liuyue-jian/sheng"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(SHENG "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" SHENG "。\n");

        if (me->query_skill("force") < 200)
                return notify_fail("你的内功的修为不够，难以施展" SHENG "。\n");

        if (me->query_skill("liuyue-jian", 1) < 140)
                return notify_fail("你的流月剑舞修为不够，难以施展" SHENG "。\n");

        if (me->query("neili") < 300)
                return notify_fail("你的真气不够，难以施展" SHENG "。\n");

        if (me->query_skill_mapped("sword") != "liuyue-jian")
                return notify_fail("你没有激发流月剑舞，难以施展" SHENG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "手腕一阵疾抖，剑身微颤，剑作龙吟。刹那间剑芒陡涨，"
              "如天河倒泻一般洒向$n"
              HIW "。\n" NOR;

        message_combatd(msg, me, target);
        me->add("neili", -100);

        for (i = 0; i < 6; i++)
        {
                if (! me->is_fighting(target))
                        break;
                COMBAT_D->do_attack(me, target, weapon, 0);
        }

        me->start_busy(1 + random(6));

        return 1;
}

