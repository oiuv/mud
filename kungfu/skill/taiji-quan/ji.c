#include <ansi.h>
#include <combat.h>

#define JI "「" HIW "挤字诀" NOR "」"

inherit F_SSERVER;

int perform(object me)
{
        string msg;
        object target;
        int skill, ap, dp, damage;

        if (userp(me) && ! me->query("can_perform/taiji-quan/ji"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(JI "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(JI "只能空手施展。\n");

        skill = me->query_skill("taiji-quan", 1);

        if (skill < 150)
                return notify_fail("你的太极拳等级不够，难以施展" JI "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你的真气不够，难以施展" JI "。\n");
 
        if (me->query_skill_mapped("unarmed") != "taiji-quan")
                return notify_fail("你没有激发太极拳，难以施展" JI "。\n");

        if (me->query_skill_prepared("unarmed") != "taiji-quan")
                return notify_fail("你现在没有准备使用太极拳，无法使用" JI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "使出太极拳「挤」字诀，右脚实，左脚虚，粘连粘"
              "随，右掌已搭住$n" HIW "左腕，横劲发出。\n" NOR;

        damage = skill / 2 + random(skill / 2);

        ap = me->query_skill("unarmed");
        dp = target->query_skill("parry");
        if (ap / 2 + random(ap) > dp)
        {
                me->add("neili", -30);
                me->start_busy(2);
                target->receive_damage("jing", damage);
                target->receive_wound("jing", damage);
                msg += COMBAT_D->do_damage(me, target, REMOTE_ATTACK,
                       damage, 0, HIR "$n" HIR "稍不留神，让$N" HIR
                       "这么一挤，只觉全身力气犹似流入汪洋大海，无影"
                       "无踪。\n" NOR);
        }
        else
        {
                me->add("neili", -10);
                msg += CYN "$n" CYN "见状大吃一惊，急忙向后猛退数步，"
                       "终于避开了$N" CYN "这一击。\n" NOR;
                me->start_busy(4);
        }
        message_combatd(msg, me, target);
        return 1;
}
