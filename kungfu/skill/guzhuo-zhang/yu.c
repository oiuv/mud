#include <ansi.h>
#include <combat.h>

#define YU "「" HIR "大智若愚" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/guzhuo-zhang/yu"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(YU "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(YU "只能空手使用。\n");

        if ((int)me->query_skill("force") < 260)
                return notify_fail("你内功修为不够，难以施展" YU "。\n");

        if ((int)me->query("max_neili") < 2800)
                return notify_fail("你内力修为不够，难以施展" YU "。\n");

        if ((int)me->query_skill("guzhuo-zhang", 1) < 180)
                return notify_fail("你古拙掌法火候不够，难以施展" YU "。\n");

        if (me->query_skill_mapped("strike") != "guzhuo-zhang")
                return notify_fail("你没有激发古拙掌法，难以施展" YU "。\n");

        if (me->query_skill_prepared("strike") != "guzhuo-zhang")
                return notify_fail("你没有准备古拙掌法，难以施展" YU "。\n");

        if ((int)me->query("neili") < 600)
                return notify_fail("你现在真气不够，难以施展" YU "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "体内真气迸发，大喝一声，双掌向$n" HIR "平平推"
              "去，招数朴实无华，毫无半点花巧可言。\n" NOR;  

        ap = me->query_skill("strike") + me->query("str") * 10;
        dp = target->query_skill("force") + target->query("int") * 10;

        me->start_busy(3);

        if (ap / 2 + random(ap) > dp)
        { 
                damage = ap + random(ap / 2);
                me->add("neili", -300);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 70,
                                           HIR "$n" HIR "勘破不透掌中虚实，$N" HIR
                                           "双掌正中$p" HIR "前胸，“喀嚓喀嚓”接"
                                           "连断了数根肋骨。\n" NOR);
        } else
        {
                msg += CYN "$n" CYN "见$N" CYN "这掌来势非凡，不敢"
                       "轻易招架，当即飞身纵跃闪开。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}

