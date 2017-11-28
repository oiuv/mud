#include <ansi.h>
#include <combat.h>

#define CHONG "「" HIY "冲刺攻击" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int i;

        if (userp(me) && ! me->query("can_perform/qishi-ji/chong"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(CHONG "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "club")
                return notify_fail("你所使用的武器不对，难以施展" CHONG "。\n");

        if (me->query_skill("qishi-ji", 1) < 100)
                return notify_fail("你圣骑士戟修为不够，难以施展" CHONG "。\n");

        if (me->query_skill_mapped("club") != "qishi-ji")
                return notify_fail("你没有激发圣骑士戟，难以施展" CHONG "。\n");

        if (me->query_skill("force") < 150)
                return notify_fail("你的内功修为不够，难以施展" CHONG "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你现在的真气不够，难以施展" CHONG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "狂哮一声，手中" + weapon->name() + HIY "接连六"
              "刺，竟似幻作六道电光，尽数刺向$n" HIY "！\n" NOR;

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

