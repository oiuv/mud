#include <ansi.h>
#include <combat.h>

#define LIAN "「" HIR "五绝连环" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg, skill;
        int i;

        if (userp(me) && ! me->query("can_perform/duanjia-jian/lian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(LIAN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || ((string)weapon->query("skill_type") != "staff"
           && (string)weapon->query("skill_type") != "sword"))
                return notify_fail("你使用的武器不对，难以施展" LIAN "。\n");

        if ((int)me->query_skill("duanjia-jian", 1) < 120)
                return notify_fail("你的段家剑法不够娴熟，难以施展" LIAN "。\n");

        skill = weapon->query("skill_type");

        if (me->query_skill_mapped(skill) != "duanjia-jian")
                return notify_fail("你现在没有激发段家剑，难以施展" LIAN "。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功修为不够，难以施展" LIAN "。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你现在的真气不够，难以施展" LIAN "。\n");
        
        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "深吸一口气，脚下步步进击，稳重之极，手中的" +
              weapon->name() + HIY "使得犹如飞龙一般，缠绕向$n" HIY "！\n" NOR;
        message_combatd(msg, me, target);

        me->add("neili", -100);

        for (i = 0; i < 5; i++)
        {
                if (! me->is_fighting(target))
                        break;
                if (random(5) == 0 && ! target->is_busy())
                        target->start_busy(1);
                COMBAT_D->do_attack(me, target, weapon, 0);
        }

        me->start_busy(1 + random(5));
        return 1;
}
