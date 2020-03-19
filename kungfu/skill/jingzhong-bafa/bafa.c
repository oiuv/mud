#include <ansi.h>

inherit F_SSERVER;
 
int perform(object me, object target)
{
        object weapon;
        string msg;
        int count;
        int i;
 
        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail("井中八法只能对战斗中的对手使用。\n");
 
        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("手中没刀还使什么井中八法。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你的真气不够！\n");

        if ((int)me->query_skill("force") < 300)
                return notify_fail("你的内功火候不够！\n");

        if ((int)me->query_skill("jingzhong-bafa", 1) < 200)
                return notify_fail("你的井中八法还不到家，无法施展绝招。\n");

        if (me->query_skill_mapped("blade") != "jingzhong-bafa")
                return notify_fail("你没有激发井中八法，无法施展绝招。\n");

        msg = HIY "$N" HIY "一声清啸，手中的" + weapon->name() +
              HIY "将「井中八法」一齐施出，刀法变化莫测，笼罩了$n" HIY "周身要害！\n" NOR;

        if (random(me->query_skill("blade")) > target->query_skill("parry") / 3)
        {
                msg += HIR "$n" HIR "见来招实在是变幻莫测，不由得心"
                       "生惧意，招式登时出了破绽！\n" NOR;
                count = me->query_skill("jingzhong-bafa)", 1) / 3;
        } else
        {
                msg += HIC "$n" HIC "心底微微一惊，打起精神小心接招。\n" NOR;
                count = 0;
        }

        message_combatd(msg, me, target);
        me->add("neili", -150);
        me->add_temp("apply/attack", count);

        for (i = 0; i < 8; i++)
        {
                if (! me->is_fighting(target))
                        break;
                if (random(3) == 1 && ! target->is_busy())
                        target->start_busy(1);
                COMBAT_D->do_attack(me, target, weapon, 0);
        }

        me->add_temp("apply/attack", -count);
        me->start_busy(1 + random(6));
        return 1;
}

