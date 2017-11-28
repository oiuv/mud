#include <ansi.h>
#include <combat.h>

#define PO "「" HIW "破山斧" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/songshan-zhang/po"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(PO "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(PO "只能空手施展。\n");

        if ((int)me->query_skill("songshan-zhang", 1) < 30)
                return notify_fail("你嵩山掌法不够娴熟，难以施展" PO "。\n");

        if (me->query_skill_prepared("strike") != "songshan-zhang")
                return notify_fail("你没有准备嵩山掌法，难以施展" PO "。\n");

        if (me->query_skill("force") < 40)
                return notify_fail("你的内功修为不够，难以施展" PO "。\n");

        if ((int)me->query("neili") < 120)
                return notify_fail("你现在的真气不够，难以施展" PO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        ap = me->query_skill("strike");
        dp = target->query_skill("parry");

        msg = HIC "\n$N" HIC "右掌高举，施一招「" HIW "破山斧"
              HIC "」，掌速极快，犹如一把利斧从天而下，劈向$n\n" 
              HIC "。" NOR;
        
        message_sort(msg, me, target);

        if (ap / 2 + random(ap) > dp)
        {
                damage = (int)me->query_skill("songshan-zhang", 1);
                damage += random(damage / 2);

                msg = COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 30,
                                          HIR "$N" HIR "出手既快，方位又奇，$n"
                                          HIR "闪避不及，却已中掌。\n" NOR);

                me->add("neili", -100);
	        me->start_busy(2 + random(2));                                         
        } else
        {
                msg = CYN "$n" CYN "不慌不忙，以快打快，将$N"
                      CYN "这招化去。\n" NOR;

                me->add("neili", -30);
	        me->start_busy(2 + random(3));
        }
        message_vision(msg, me, target);
        return 1;
}
