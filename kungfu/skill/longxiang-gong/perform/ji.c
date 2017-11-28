#include <ansi.h>
#include <combat.h>

#define JI "「" HIY "般若极" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
//      object weapon;
        int ap, dp, shd, jia, layer, damage;
        string msg;

        if (userp(me) && ! me->query("can_perform/longxiang-gong/ji"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(JI "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(JI "只能空手施展。\n");

        if ((int)me->query_skill("longxiang-gong", 1) < 300)
                return notify_fail("你的龙象般若功修为不够，难以施展" JI "。\n");

        if (me->query("max_neili") < 5000)
                return notify_fail("你的内力修为不足，难以施展" JI "。\n");

        if (me->query_skill_mapped("unarmed") != "longxiang-gong")
                return notify_fail("你没有激发龙象般若功为拳脚，难以施展" JI "。\n");

        if (me->query_skill_mapped("force") != "longxiang-gong")
                return notify_fail("你没有激发龙象般若功为内功，难以施展" JI "。\n");

        if (me->query_skill_prepared("unarmed") != "longxiang-gong")
                return notify_fail("你没有准备使用龙象般若功，难以施展" JI "。\n");

        if (me->query("neili") < 800)
                return notify_fail("你现在的真气不足，难以施展" JI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        layer = me->query_skill("longxiang-gong", 1) / 30;

        if (layer > 13) layer = 13;

        msg = HIY "$N" HIY "运转龙象般若功第" + chinese_number(layer) + "层"
              "功力，双拳携着『" HIR "十龙十象" HIY "』之力朝$n" HIY "崩击"
              "\n而出，拳锋过处，竟卷起万里尘埃，正是密宗绝学「" HIW "般若"
              "极" HIY "」。\n" NOR;

        ap = me->query_skill("unarmed") +
             me->query_skill("force");

        dp = target->query_skill("parry") +
             target->query_skill("force");

        if (ap / 2 + random(ap) > dp)
        {
                if (target->query_temp("shield"))
		{
                	shd = target->query_temp("apply/armor");

                	target->add_temp("apply/armor", -shd);
                	target->delete_temp("shield");

                	msg += HIW "$N" HIW "罡气涌至，竟然激起层层气浪，顿时将$n"
                               HIW "的护体真气摧毁得荡然无存！\n" NOR;
		}
                jia = me->query("jiali");
                damage = ap / 2 + random(jia * 5);

                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 80,
                                               HIR "$n" HIR "不及闪避，顿被$N" HIR
                                               "双拳击个正中，般若罡劲破体而入，尽"
                                               "伤三焦六脉。\n" NOR);

                me->start_busy(4);
                me->add("neili", -600);
        } else
        {
                me->start_busy(4);
                me->add("neili", -400);
                msg += CYN "可是$p" CYN "识破了$P"
                       CYN "这一招，斜斜一跃避开。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}