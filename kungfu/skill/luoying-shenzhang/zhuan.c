#include <ansi.h>
#include <combat.h>

#define ZHUAN "「" HIY "奇门五转" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/luoying-shenzhang/zhuan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZHUAN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(ZHUAN "只能空手施展。\n");

        if ((int)me->query_skill("luoying-shenzhang", 1) < 120)
                return notify_fail("你的落英神剑掌不够娴熟，难以施展" ZHUAN "。\n");

        if ((int)me->query_skill("qimen-wuxing", 1) < 120)
                return notify_fail("你对奇门五行的研究不够，难以施展" ZHUAN "。\n");

        if (me->query_skill_mapped("strike") != "luoying-shenzhang")
                return notify_fail("你没有激发落英神剑掌，难以施展" ZHUAN "。\n");

        if (me->query_skill_prepared("strike") != "luoying-shenzhang")
                return notify_fail("你没有准备落英神剑掌，难以施展" ZHUAN "。\n");

        if ((int)me->query_skill("force") < 180)
                return notify_fail("你的内功火候不足，难以施展" ZHUAN "。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你现在的内力不够，难以施展" ZHUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "掌势陡然一变，施出落英神剑掌「奇门五转」绝技，虚虚"
              "实实的攻向$n" HIY "。\n" NOR;

        ap = (int)me->query_skill("luoying-shenzhang", 1) +
             (int)me->query_skill("qimen-wuxing", 1) +
             (int)me->query_skill("force") +
             (int)me->query("int") * 10;

        dp = (int)target->query_skill("dodge") +
             (int)target->query_skill("parry") +
             (int)target->query_skill("qimen-wuxing", 1) +
             (int)target->query("int") * 10;

        me->add("neili", -150);
        if (ap / 2 + random(ap) > dp)
        {
                target->start_busy(2 + random(3));
	        me->start_busy(2);
                damage = (int)me->query_skill("force") + (int)me->query_skill("strike");
                damage = damage / 4;
                damage += random(damage);

                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 30,
                                           HIR "$n" HIR "大吃一惊，登时接连中掌，"
                                           "狂喷出一口鲜血，身子急转个不停。\n" NOR);
        } else
	{
	        me->start_busy(3);
                msg += HIC "可是$p" HIC "看破了$P" HIC "的企图，连消带打，避开了$P"
                       HIC "这一击。\n"NOR;
	}
        message_vision(msg, me, target);
        return 1;
}
