#include <ansi.h>
#include <combat.h>

#define LIAN "「" HIW "三连环" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp, damage;
        //int i, count;

        if (userp(me) && ! me->query("can_perform/quanzhen-jian/lian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(LIAN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你手中无剑，如何施展" LIAN "绝技。\n");

        if ((int)me->query_skill("quanzhen-jian", 1) < 180)
                return notify_fail("你全真剑法不够娴熟，难以施展" LIAN "。\n");

        if (me->query_skill_mapped("sword") != "quanzhen-jian")
                return notify_fail("你没有激发全真剑法，难以施展" LIAN "。\n");

        if (me->query_skill_mapped("strike") != "haotian-zhang" &&
			me->query_skill_mapped("strike") != "chongyang-shenzhang")
                return notify_fail("你没有激发全真的掌法，难以施展" LIAN "。\n");

        if ((int)me->query("neili") < 400)
                return notify_fail("你现在的真气不足，难以施展" LIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        me->start_busy(3);
        me->add("neili", -60);

        msg = HIR "拆得数招，$N左剑平刺，右掌正击，同时左腿横扫而出，正是全真派中的" LIAN HIR"绝招。\n" NOR;
        message_combatd(msg, me, target);

        COMBAT_D->do_attack(me, target, weapon, 1);

        weapon->unequip();
        COMBAT_D->do_attack(me, target, 0, 1);

        ap = me->query_skill("sword") + me->query_skill("unarmed", 1);
        dp = target->query_skill("parry");

        message_combatd(HIY "$N" HIY "身法一变，唰地一腿，贴地向$n横扫而出，只带得地上尘土飞扬。\n" NOR, me, target);

        if(random(ap) > dp / 2)
        {
                damage = ap / 2 + random(ap);

                msg = COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 70,
                                           HIR "只见$n躲闪不及，已经被$N一腿扫中，惨叫声中，向后跌出丈许。\n" NOR);
                me->add("neili", -150);
				message_combatd(msg, me, target);
        } else
        {
				message_combatd(HIY "$n见此招来势凶猛，向后一跃，轻巧地躲了开去。\n" NOR, me, target);
				me->add("neili", -50);
		}

        weapon->wield();

        return 1;
}

