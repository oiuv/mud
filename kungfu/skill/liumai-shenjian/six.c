#include <ansi.h>

#define SIX "「" HIW "六脉剑气" NOR "」"

inherit F_SSERVER;


int perform(object me, object target)
{
        // mapping prepare;
        string msg;
        int skill;
        int delta;
        int i;
        int ap, dp;

        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/liumai-shenjian/six"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(SIX "只能对战斗中的对手使用。\n");

        if (me->query_skill_prepared("finger") != "liumai-shenjian")
                return notify_fail("你没有准备使用六脉神剑，无法施展" SIX "。\n");

        skill = me->query_skill("liumai-shenjian", 1);

        if (skill < 220)
                return notify_fail("你的六脉神剑修为有限，无法使用" SIX "！\n");

        if (me->query_skill("force") < 400)
                return notify_fail("你的内功火候不够，难以施展" SIX "！\n");

        if (me->query("max_neili") < 7000)
                return notify_fail("你的内力修为没有达到那个境界，无法运转内"
                                   "力形成" SIX "！\n");

        if (me->query("neili") < 500)
                return notify_fail("你的真气不够，现在无法施展" SIX "！\n");

        if (me->query_temp("weapon"))
                return notify_fail("你必须是空手才能施展" SIX "！\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "摊开双手，手指连弹，霎时间空气炙热，几"
              "欲沸腾，六道剑气分自六穴，一起冲向$n" HIW "！\n" NOR;

        ap = me->query_skill("finger");
        dp = target->query_skill("force");
        if (ap / 2 + random(ap) > dp)
        {
                msg += HIR "$n" HIR "见此剑气纵横，微一愣神，不禁心萌退意。\n" NOR;
                delta = -skill / 5;
        } else
                delta = 0;

        message_combatd(msg, me, target);

        me->add("neili", -400);
        target->add_temp("apply/parry", delta);
        target->add_temp("apply/dodge", delta);
        for (i = 0; i < 6; i++)
        {
                if (! me->is_fighting(target))
                        break;

                if (random(2) == 1 && ! target->is_busy())
                        target->start_busy(1);

                me->set_temp("liumai-shenjian/hit_msg", i);

                COMBAT_D->do_attack(me, target, 0, i * 3);
        }
        target->add_temp("apply/parry", -delta);
        target->add_temp("apply/dodge", -delta);
        me->delete_temp("liumai-shenjian/hit_msg");
        me->start_busy(1 + random(5));

        return 1;
}
