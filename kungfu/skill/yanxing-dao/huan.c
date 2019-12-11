#include <ansi.h>
#include <combat.h>

#define HUAN "「" HIY "无形幻影" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        // int damage;
        string msg;
        object weapon;
        int i;

        if (userp(me) && ! me->query("can_perform/yanxing-dao/huan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(HUAN "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你的武器不对，难以施展" HUAN "。\n");

        if ((int)me->query_skill("yanxing-dao", 1) < 60 )
                return notify_fail("你雁行刀法不够娴熟，难以施展" HUAN "。\n");

        if ((int)me->query_skill("force") < 120 )
                return notify_fail(RED"你内功火候不够，难以施展" HUAN "。\n");

        if (me->query_skill_mapped("blade") != "yanxing-dao")
                return notify_fail("你没有激发雁行刀法，难以施展" HUAN "。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail(HIC"你现在真气不够，难以施展" HUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIC "$N" HIC "大喝一声，全场四处游动，$n"
              HIC "只看到$N" HIC "化做数团身影，漫天刀"
              HIC "光席卷而来！\n"NOR;
        message_combatd(msg, me, target);

        for (i = 0; i < 5; i++)
        {
                if (! me->is_fighting(target))
                        break;
        	COMBAT_D->do_attack(me, target, weapon, 0);
        }

        me->add("neili", -80);
        me->start_busy(1 + random(4));
        return 1;
}
