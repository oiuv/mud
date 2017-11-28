#include <ansi.h>
#include <combat.h>

#define JUEHU "「" HIR "绝户神抓" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;

        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/huzhua-shou/juehu"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(JUEHU "只能在战斗中对对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail("你必须空手才能使用" JUEHU "。\n");

        if (userp(me) && me->query("shen") < 10000)
                return notify_fail(HIC "\n你恶念顿生，刚想施展毒招，可突然想到当初俞莲舟"
                                   "的一番告诫，不得不中途放弃了攻击。\n" NOR);

        if ((int)me->query_skill("huzhua-shou", 1) < 120)
                return notify_fail("你的虎爪绝户手不够娴熟，难以施展" JUEHU "。\n");

        if (me->query_skill_mapped("claw") != "huzhua-shou")
                return notify_fail("你没有激发虎爪绝户手，难以施展" JUEHU "。\n");

        if (me->query_skill_prepared("claw") != "huzhua-shou")
                return notify_fail("你没有准备使用虎爪绝户手，无法使用" JUEHU "。\n");

        if (me->query("neili") < 300)
                return notify_fail("你现在真气不够，难以施展" JUEHU "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "大喝一声，变掌为爪，双爪化出漫天爪影，如狂风骤雨一般向$n"
              HIR "的要害抓去！\n" NOR;

        if (random(me->query_skill("claw")) > target->query_skill("parry") / 2)
        {
                me->start_busy(2);

                damage = me->query_skill("huzhua-shou", 1);
                damage = damage * 3 + random(damage * 6);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 40,
                                           HIR "结果$p" HIR "一声惨嚎，没能招架住$P"
                                           HIR "凌厉的攻势，被抓得皮肉分离，鲜血飞溅！\n" NOR);
                me->add("neili", -200);
        	me->add("shen", -3000);
        } else
        {
                me->start_busy(3);
	        me->add("neili", -100);
        	me->add("shen", -3000);
                msg += CYN "可是$p" CYN "看破了$N"
                       CYN "的企图，躲开了这招杀着。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}

