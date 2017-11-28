#include <ansi.h>
#include <combat.h>

#define HUAN "「" HIG "千幻神诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/wudu-shenzhang/huan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(HUAN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(HUAN "只能空手施展。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if ((int)me->query_skill("wudu-shenzhang", 1) < 100)
                return notify_fail("你五毒神掌不够娴熟，难以施展" HUAN "。\n");

        if (me->query_skill_prepared("strike") != "wudu-shenzhang")
                return notify_fail("你没有准备五毒神掌，难以施展" HUAN "。\n");

        if (me->query_skill("dodge") < 150)
                return notify_fail("你的轻功修为不够，难以施展" HUAN "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在的真气不够，难以施展" HUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        ap = me->query_skill("wudu-shenzhang", 1) +
             me->query_skill("dodge", 1) / 2;

        dp = target->query_skill("dodge");

        msg = HIC "\n$N" HIC "身法陡然变快，使出绝招「" HIG "千幻神诀" HIC "」，"
              "双掌不断拍出，\n招式如影如幻，虚实难测，试图扰乱$n" HIC "的攻"
              "势。\n" NOR;

        message_sort(msg, me, target);

        if (random(ap) > dp / 2)
        {
		msg = HIY "$n" HIY "只见$N" HIY "双掌飘忽不定，毫"
                      "无破绽，竟被困在$N" HIY "的掌风之中。\n" NOR;

                target->start_busy(ap / 45 + 1);
               	me->start_busy(1);
                me->add("neili", -80);
        } else
        {
                msg = CYN "$n" CYN "看破$N" CYN "毫无攻击之意，于"
                      "是大胆反攻，将$N" CYN "这招尽数化解。\n" NOR;

                me->start_busy(2);
                me->add("neili", -30);
        }
        message_combatd(msg, me, target);

        return 1;
}
