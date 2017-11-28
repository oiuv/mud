// bagua.c 八卦阵

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
                return notify_fail("「八卦阵芒」只能对战斗中的对手使用。\n");
 
        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你的兵器不对。\n");

        if ((int)me->query("max_neili") < 2000)
                return notify_fail("你的内力修为不够。\n");

        if ((int)me->query("neili") < 400)
                return notify_fail("你的真气不够！\n");

        if ((int)me->query_skill("force") < 220)
                return notify_fail("你的内功火候不够！\n");

        if ((int)me->query_skill("zijinbagua-dao", 1) < 200)
                return notify_fail("你的紫金八卦刀还不到家，无法使用「八卦阵芒」！\n");

        if (me->query_skill_mapped("blade") != "zijinbagua-dao")
                return notify_fail("你没有激发紫金八卦刀，无法使用「八卦阵芒」！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = MAG "$N" MAG "一声暴喝，手中的" + weapon->name() +
              MAG "刀芒陡长，顿时只见万股凌厉的刀芒按照八卦阵的"
              "方位直涌$n" MAG "！\n\n" NOR;

        if (random(me->query_skill("blade")) > target->query_skill("parry") / 2)
        {
                msg += HIR "$n" HIR "见来招实在是变幻莫测，不由得心"
                       "生惧意，招式登时出了破绽！\n" NOR;
                count = me->query_skill("zijinbagua-dao", 1) / 6;
        } else
        {
                msg += HIY "$n" HIY "心底微微一惊，打起精神小心接招。\n" NOR;
                count = 0;
        }

        message_combatd(msg, me, target);
        me->add("neili", -300);
        me->add_temp("apply/attack", count);

        for (i = 0; i < 5 + random(3) ; i++)
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
