#include <ansi.h>
#include "/kungfu/skill/eff_msg.h";

#define JIA "「" HIY "掌中夹镖" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int ap, dp, damage, p;
        string pmsg;
        string msg;
        object weapon;

        if (userp(me) && ! me->query("can_perform/bagua-zhang/jia"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(JIA "只能在战斗中对对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(JIA "只能空手施展。\n");

        if (! objectp(weapon = me->query_temp("handing")) ||
            (string)weapon->query("skill_type") != "throwing")
                return notify_fail("你现在手中并没有拿着暗器。\n");

        if (me->query_skill_mapped("strike") != "bagua-zhang") 
                return notify_fail("你没有激发八卦掌，难以施展" JIA "。\n");

        if (me->query_skill_prepared("strike") != "bagua-zhang") 
                return notify_fail("你没有准备八卦掌，难以施展" JIA "。\n");

        if (me->query_skill_mapped("throwing") != "bagua-biao") 
                return notify_fail("你没有激发八卦镖诀，难以施展" JIA "。\n");

        if ((int)me->query_skill("bagua-zhang", 1) < 120)
                return notify_fail("你的八卦掌不够娴熟，难以施展" JIA "。\n");

        if ((int)me->query_skill("bagua-biao", 1) < 120)
                return notify_fail("你的八卦镖诀不够娴熟，难以施展" JIA "。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，难以施展" JIA "。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你现在真气不足，难以施展" JIA "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        me->add("neili", -100);
        weapon->add_amount(-1);

        msg = HIY "$N" HIY "一声暴喝，一掌重重击向$n" HIY "，$p" HIY
              "正欲格挡，忽然只见眼前金光一闪，一股劲风已由$N" HIY
              "掌中激射而出！\n" NOR;

        me->start_busy(2);

        ap = me->query_skill("strike") + me->query_skill("throwing");
        dp = target->query_skill("dodge") + target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 4 + random(ap / 4);
                msg += HIR "$n" HIR "果真始料不及，$N" HIR "那" +
                       weapon->query("base_unit") + weapon->name() +
                       HIR "正好打在$p" HIR "要穴上，顿时血气上涌，"
                       "连退数步！\n" NOR;
                target->receive_damage("qi", damage * 3 / 2, me);
                target->receive_wound("qi", damage, me);
	        p = (int)target->query("qi") * 100 / (int)target->query("max_qi");

                COMBAT_D->clear_ahinfo();
                weapon->hit_ob(me, target, me->query("jiali") + 100);
                if (stringp(pmsg = COMBAT_D->query_ahinfo()))
                        msg += pmsg;
                        msg += "( $n" + eff_status_msg(p) + " )\n";
                message_combatd(msg, me, target);

        } else
        {
                msg += CYN "可是$p" CYN "早料得$P"
                       CYN "有此一着，哈哈一笑，斜跳闪开。\n" NOR;
                message_combatd(msg, me, target);
        }
        me->reset_action();
        return 1;
}
