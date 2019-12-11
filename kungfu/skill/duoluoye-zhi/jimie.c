// jumie.c  少林多罗叶指－菩提寂灭

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
        // object weapon; 
        string msg;
        int ap, dp;
        int damage;

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail("「菩提寂灭」只能在战斗中对对手使用。\n");

        if (me->query_temp("weapon") ||
            me->query_temp("secondary_weapon"))
                return notify_fail("你必须空手才能使用「菩提寂灭」！\n");

        if (me->query_skill("force") < 200)
                return notify_fail("你的内功的修为不够，不能使用这一绝技！\n");

        if (me->query_skill("duoluoye-zhi", 1) < 180)
                return notify_fail("你的多罗叶指修为不够，目前不能使用「菩提寂灭」！\n");

        if (me->query("neili") < 800 || me->query("max_neili") < 2500)
                return notify_fail("你的真气不够，无法使用「菩提寂灭」！\n");

        if (me->query_skill_mapped("finger") != "duoluoye-zhi")
                return notify_fail("你没有激发多罗叶指，不能使用「菩提寂灭」！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIB "$N" HIB "运起全身功力，直扑向$n" + HIB "，双手一圈，用一股内劲" +
              "拖住$n，" + HIB "随即全力一指戳出，不惜耗费大量真元，力求一击毙敌！\n" NOR;

        ap = me->query_skill("finger", 1) + me->query_skill("duoluoye-zhi", 1);
        dp = target->query_skill("dodge", 1) + target->query_skill("force", 1);
        damage = random(ap) + ap;

        if (ap / 2 + random(ap) > dp)
        {
                me->add("neili", -500);
                me->start_busy(2);

                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 70,
                                           HIR "只见$p" HIR "一声惨号，已被$P" +
                                           HIR "一指击中，一股霸道的内力由$P" +
                                           HIR "的指尖传来，伤及经脉！\n" NOR);
        } else
        {
                me->add("neili", -200);
                me->start_busy(3);
                msg += CYN "可是$p" CYN "内力深厚，及时摆脱了"
                       CYN "$P" CYN "内力的牵扯，躲开了这一击！\n" NOR;
        }

        msg += HIR "而$P" + HIR "由于内力提升过度，经脉负荷不" +
               "了，受了不轻的内伤！\n" NOR;

        me->receive_damage("qi", damage / 4);

        message_combatd(msg, me, target);

        return 1;
}
