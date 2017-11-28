#include <ansi.h>
#include <combat.h>

#define ZHUI "「" HIM "毒龙双锥" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp, damage;
        object ob;

        if (userp(me) && ! me->query("can_perform/tianlong-jian/zhui"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZHUI "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" ZHUI "。\n");

        if ((int)me->query_skill("tianlong-jian", 1) < 120)
                return notify_fail("你的天龙剑法火候太浅，难以施展" ZHUI "。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功修为太浅，难以施展" ZHUI "。\n");

        if ((int)me->query("max_neili") < 1500)
                return notify_fail("你的内力修为太浅，难以施展" ZHUI "。\n");

        if (me->query_skill_mapped("sword") != "tianlong-jian")
                return notify_fail("你没有激发天龙剑法，难以施展" ZHUI "。\n");

        if ((int)me->query("neili", 1) < 500)
                return notify_fail("你现在的真气不足，，难以施展" ZHUI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

	damage = ap / 3 + random(ap / 2);

        msg = HIM "$N" HIM "一声清啸，手中" + weapon->name() + HIM "急速旋转，剑尖"
              "作锥，剑身顿时腾起一股旋风，向$n" HIM "钻去。\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 30,
                                           HIR "$n" HIR "招架不住，哧地一声，$N"
                                           HIR "手中的" + weapon->name() + HIR
                                           "顿时破体钻入，鲜血四溅！\n" NOR);
        } else
        {
                msg += CYN "可是$n" CYN "奋力格挡，终于架开了$N"
                       CYN "的这一剑。\n" NOR;
        }

        msg += HIM "\n$N" HIM "随即抽剑回转，撩下劈上，手中" + weapon->name() + HIM 
               "剑尖一颤，又激荡出一股旋涡劲钻向$n" HIM "。\n" NOR;
        if (ap * 2 / 5 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 40,
                                           HIR "$n" HIR "急忙抽身后退，可只见$N"
                                           HIR + weapon->name() + HIR "剑芒一漾"
                                           "，胸口便喷出一股血柱！\n" NOR);
        } else
        {
        	msg += CYN "可是$n" CYN "凝神聚气，飞身一跃而起，避开了$N"
                       CYN "的杀着。\n" NOR;
	}
        me->start_busy(2 + random(3));
        me->add("neili", -350);
        message_combatd(msg, me, target);
        return 1;
}
