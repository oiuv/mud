#include <ansi.h>
#include <combat.h>

#define LUO "「" HIW "瀑落九霄" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        object weapon;
        int i;

        if (userp(me) && ! me->query("can_perform/biyan-dao/luo"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(LUO "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你的武器不对，难以施展" LUO "。\n");

        if ((int)me->query_skill("biyan-dao", 1) < 80 )
                return notify_fail("你碧烟刀法不够娴熟，难以施展" LUO "。\n");

        if ((int)me->query_skill("force") < 120 )
                return notify_fail(RED"你内功火候不够，难以施展" LUO "。\n");

        if (me->query_skill_mapped("blade") != "biyan-dao")
                return notify_fail("你没有激发碧烟刀法，难以施展" LUO "。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail(HIC"你现在真气不够，难以施展" LUO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "大喝一声，手中" + weapon->name() + HIW
              "一振，便如飞瀑一般向$n" HIW "席卷而去！\n" NOR;
        message_combatd(msg, me, target);

        for (i = 0; i < 5; i++)
        {
                if (! me->is_fighting(target))
                        break;
        	COMBAT_D->do_attack(me, target, weapon, 0);
        }

        me->add("neili", -80);
        me->start_busy(1 + random(3));
        return 1;
}
