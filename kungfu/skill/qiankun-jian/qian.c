// qian.c

#include <ansi.h>
#include <combat.h>

#define QIAN "「" HIY "乾坤劲" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;

        if (userp(me) && ! me->query("can_perform/qiankun-jian/qian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(QIAN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" QIAN "。\n");

        if (me->query_skill("force") < 150)
                return notify_fail("你的内功的修为不够，难以施展" QIAN "。\n");

        if (me->query_skill("qiankun-jian", 1) < 100)
                return notify_fail("你的乾坤神剑修为不够，难以施展" QIAN "。\n");

        if (me->query("neili") < 300)
                return notify_fail("你的真气不够，难以施展" QIAN "。\n");

        if (me->query_skill_mapped("sword") != "qiankun-jian")
                return notify_fail("你没有激发乾坤神剑，难以施展" QIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "身形一展，施展乾坤剑法绝技，手中"
              + weapon->name() + HIY "斜斜刺出，剑尖顿时闪出"
              "一道凌厉的青芒，直奔$n" + HIY "而去！\n" NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap / 2);
                me->add("neili", -150);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 60,
                                           HIR "$n" HIR "见状连忙格挡，可哪里来得"
                                           "及，只觉全身一麻，剑气已透胸而过。\n"
                                           NOR);
        } else
        {
                me->add("neili", -50);
                me->start_busy(3);
                msg += CYN "可是" CYN "$n" CYN "一声冷"
                       "笑，飞身一跃而起，避开了" CYN
                       "$N" CYN "发出的剑气。\n"NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
