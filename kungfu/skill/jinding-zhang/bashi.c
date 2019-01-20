#include <ansi.h>
#include <combat.h>

#define BASHI "「" HIY "八式合一" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        // object weapon;
        int damage;
        string msg;
        // int count,d_count,qi, maxqi, skill;

        if (userp(me) && ! me->query("can_perform/jinding-zhang/bashi"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(BASHI "只能在战斗中对对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(BASHI "只能空手施展。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你的内力还不够，难以施展" BASHI "。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功的修为不够，难以施展" BASHI "。\n");

        if ((int)me->query_skill("jinding-zhang", 1) < 100)
                return notify_fail("你的金顶绵掌的修习不够，难以施展" BASHI "。\n");

        if (me->query_skill_mapped("strike") != "jinding-zhang")
                return notify_fail("你没有激发金顶绵掌，难以施展" BASHI "。\n");

        if (me->query_skill_prepared("strike") != "jinding-zhang")
                return notify_fail("你现在没有准备使用金顶绵掌，难以施展" BASHI "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "深深吸了一口气，提起全身的功力于"
              "双掌猛力拍出，只听得骨骼一阵爆响！\n" NOR;
        if (random(me->query_skill("strike")) > (int)target->query_skill("force") / 2)
        {
                damage  = (int)me->query_skill("linji-zhuang", 1);
                damage += (int)me->query_skill("jinding-zhang", 1);
                damage /= 3;
                damage += random(damage);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 30,
                                           HIR "只见漫天掌影飘忽不定的罩向$n" HIR
                                           "全身各个部位，$n" HIR "顿时接连中了数"
                                           "掌！\n" NOR);
                me->add("neili", -100);
                me->start_busy(2);
         } else
         {
                msg += CYN "可是$p" CYN "猛地向后一跃，跳出了$P"
                       CYN "的攻击范围。\n" NOR;
                me->start_busy(3);
         }
         message_combatd(msg, me, target);
         return 1;
}
