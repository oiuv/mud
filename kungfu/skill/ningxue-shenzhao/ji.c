// ji.c 疾电

#include <ansi.h>

inherit F_SSERVER;

int perform(object me, object target)
{
        // mapping prepare;
        string msg;
        int skill;
        int delta;
        int i;

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (userp(me) && ! me->query("can_perform/ningxue-shenzhao/ji"))
                return notify_fail("你还不会使用这一招！\n");

        if (! me->is_fighting(target))
                return notify_fail("「疾电」只能对战斗中的对手使用。\n");

        if (me->query_skill_prepared("claw") != "ningxue-shenzhao")
                return notify_fail("你没有准备使用凝血神爪，无法施展「疾电」。\n");

        skill = me->query_skill("ningxue-shenzhao", 1);

        if (skill < 250)
                return notify_fail("你的凝血神爪修为有限，无法使用「疾电」！\n");

        if (me->query_skill("force") < 350)
                return notify_fail("你的内功火候不够，难以施展「疾电」！\n");

        if (me->query("max_neili") < 5000)
                return notify_fail("你的内力修为没有达到那个境界，无法运转内力形成「疾电」！\n");

        if (me->query("neili") < 500)
                return notify_fail("你的真气不够，现在无法施展「疾电」！\n");

        if (me->query_temp("weapon"))
                return notify_fail("你必须是空手才能施展「疾电」！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "仰天一声长啸，飞身跃起，双爪幻出漫天爪影，气势恢弘，宛如疾电一般笼罩$n" HIR "各处要穴！\n" NOR;

        message_combatd(msg, me, target);

        me->add("neili", -300);
        target->add_temp("apply/parry", delta);
        target->add_temp("apply/dodge", delta);
        for (i = 0; i < 7; i++)
        {
                if (! me->is_fighting(target))
                        break;
                if (random(3) == 1 && ! target->is_busy())
                        target->start_busy(1);
                COMBAT_D->do_attack(me, target, 0, 0);
        }
        target->add_temp("apply/parry", -delta);
        target->add_temp("apply/dodge", -delta);
        me->start_busy(1 + random(5));

        return 1;
}
