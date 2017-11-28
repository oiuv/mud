#include <ansi.h>
#include <combat.h>

#define LUAN "「" HIR "群魔乱舞" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int i;
 
        if (userp(me) && ! me->query("can_perform/fengmo-zhang/luan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(LUAN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "staff")
                return notify_fail("你所使用的武器不对，难以施展" LUAN "。\n");

        if ((int)me->query_skill("fengmo-zhang", 1) < 120)
                return notify_fail("你疯魔杖法火候不够，难以施展" LUAN "。\n");

        if (me->query_skill_mapped("staff") != "fengmo-zhang")
                return notify_fail("你没有激发疯魔杖法，难以施展" LUAN "。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，难以施展" LUAN "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在的真气不足，难以施展" LUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "眼中杀气大盛，施出疯魔杖「" HIR "群魔乱舞"
              HIY "」绝技，手中" + weapon->name() + HIY "接二连三朝$n"
              HIY "挥去。\n" NOR;
        message_combatd(msg, me, target);

        me->add("neili", -100);

        for (i = 0; i < 5; i++)
        {
                if (! me->is_fighting(target))
                        break;

                if (random(2) && ! target->is_busy())
                        target->start_busy(1);

                COMBAT_D->do_attack(me, target, weapon, 0);
        }
        me->start_busy(1 + random(5));
        return 1;
}

