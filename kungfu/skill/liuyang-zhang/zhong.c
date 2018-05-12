#include <ansi.h>
#include <combat.h>

#define ZHONG "「" HIW "生死符" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int damage;
        int ap, dp, flvl;

        if (userp(me) && ! me->query("can_perform/liuyang-zhang/zhong"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZHONG "只能对战斗中的对手使用。\n");

        if (me->query_skill("force") < 200)
                return notify_fail("你的内功不够火候，难以施展" ZHONG "。\n");

        if ((int)me->query_skill("liuyang-zhang", 1) < 150)
                return notify_fail("你的天山六阳掌不够娴熟，难以施展" ZHONG "。\n");

        if (me->query_skill_mapped("strike") != "liuyang-zhang")
                return notify_fail("你没有激发掌法天山六阳掌，难以施展" ZHONG "。\n");
			
		if (me->query_skill_mapped("throwing") != "liuyang-zhang")
                return notify_fail("你没有激发暗器天山六阳掌，难以施展" ZHONG "。\n");

        if (me->query_skill_prepared("strike") != "liuyang-zhang")
                return notify_fail("你现在没有准备天山六阳掌，难以施展" ZHONG "。\n");

        if (me->query("neili") < 100)
                return notify_fail("你的真气不够，难以施展" ZHONG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "逆运真气，化空气中的水露为寒冰，凝于掌中，继而掌"
              "出如风，轻飘飘地向$n" HIW "拍落。\n";

        ap = me->query_skill("force") + me->query_skill("throwing") + me->query_skill("medical");
        dp = target->query_skill("force") + target->query_skill("dodge");
		flvl = me->query("jiali");
        if (ap / 3 + random(ap) > dp)
        {
                target->receive_wound("jing", 10 + random(5), me);
                damage = ap / 2 + random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, REMOTE_ATTACK, damage, 50,
                                           HIR "只见$n" HIR "被$N" HIR "一掌拍中"
                                           "，紧接着身子一颤，$P" HIR "那枚生死符"
                                           "已种入$p" HIR "体内！\n" NOR);
                target->affect_by("ss_poison",
                               ([ "level" : flvl + random(flvl * 2),
                                  "id"    : me->query("id"),
                                  "duration" : ap / 70 + random(ap / 30) ]));
                me->start_busy(1 + random(4));
        } else
        {
                msg += CYN "可是$p" CYN "内力激荡，将$P"
                       CYN "那枚生死符硬生生震出体外。\n" NOR;
                me->start_busy(3);
                target->start_busy(1);
        }
        message_combatd(msg, me, target);

        return 1;
}

