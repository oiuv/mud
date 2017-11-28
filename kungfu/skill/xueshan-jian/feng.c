// feng.c

#include <ansi.h>
#include <combat.h>

#define FENG "「" HIW "剑气封喉" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;

        if (userp(me) && ! me->query("can_perform/xueshan-jian/feng"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(FENG "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" FENG "。\n");

        if (me->query_skill("force") < 240)
                return notify_fail("你的内功的修为不够，难以施展" FENG "。\n");

        if (me->query_skill("xueshan-jian", 1) < 160)
                return notify_fail("你的雪山剑法修为不够，难以施展" FENG "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你的真气不够，难以施展" FENG "。\n");

        if (me->query_skill_mapped("sword") != "xueshan-jian")
                return notify_fail("你没有激发雪山剑法，难以施展" FENG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "只听$N" HIW "一声清啸，手中" + weapon->name() +
              HIW "龙吟不止，迸出万道光华，疾闪而过，无数劲风席卷"
              "$n" HIW "而去！\n" NOR;

        ap = me->query_skill("sword") + me->query_skill("force");
        dp = target->query_skill("dodge") + target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 3 + random(ap / 3);
                me->add("neili", -100);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 90,
                                           HIR "$n" HIR "只感寒风袭体，全身一阵冰"
                                           "凉，已被$N" HIR "剑气所伤。顿时喉咙一"
                                           "甜，喷出一大口鲜血。\n" NOR);
        } else
        {
                me->add("neili", -50);
                me->start_busy(3);
                msg += CYN "可是$n" CYN "看破" CYN "$N" CYN
                       "的招数，飞身跃开丈许，终于将这阴寒剑"
                       "气驱于无形。\n"NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
