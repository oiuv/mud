#include <ansi.h>

inherit F_SSERVER;
 
int perform(object me, object target)
{
        string msg;
        int count;
        int lvl;
        int i;
 
        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail("百花错乱只能对战斗中的对手使用。\n");

        if (me->query_skill_prepared("unarmed") != "baihua-quan" &&
            me->query_skill_prepared("cuff") != "baihua-quan" &&
            me->query_skill_prepared("strike") != "baihua-quan" &&
            me->query_skill_prepared("claw") != "baihua-quan" &&
            me->query_skill_prepared("hand") != "baihua-quan")
                return notify_fail("你现在没有准备使用百花错拳，无法施展百花错乱！\n");
 
        if (me->query_temp("weapon"))
                return notify_fail("百花错乱须是空手才能施展。\n");

        if (me->query("neili") < 300)
                return notify_fail("你的真气不够，无法施展百花错乱。\n");

        if ((lvl = me->query_skill("baihua-quan", 1)) < 160)
                return notify_fail("你的百花错拳还不够纯熟！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "只见$N使出百花错拳的精妙百花错乱，擒拿手中夹着鹰爪功，左手查拳，右手绵掌。攻\n"
                  "出去是八卦掌，收回时已是太极拳，诸家杂陈，毫无规律，只令$n眼花缭乱。\n\n" NOR;
        i = 10;
        if (lvl * 2 / 3 - random(lvl) > (int)target->query_skill("parry") / 2)
        {
                msg += HIW "$n只感到头晕目眩，只见$N或掌、或爪、或拳、或指铺天盖地的向自己各个部位袭来！\n"
                           "只一瞬间，全身竟已多了数十出伤痕，"NOR+HIR"鲜血"NOR+HIW"狂泻不止！\n"NOR;
                count = me->query_skill("baihua-quan", 1) / 6;
                me->add_temp("apply/attack", count);
                i += random(5);
        } else
        {
                msg += HIY "$n只见$N运拳如奔，快拳缤纷递出，连忙振作精神勉强抵挡。\n" NOR;
                count = 0;
        }

        message_combatd(msg, me, target);
        me->add("neili", -300);

        while (i--)
        {
                if (! me->is_fighting(target))
                        break;
                if (i > 5 && ! target->is_busy())
                        target->start_busy(1);
                COMBAT_D->do_attack(me, target, 0, 0);
        }

        me->add_temp("apply/attack", -count);
        me->start_busy(1 + random(6));
        return 1;
}


