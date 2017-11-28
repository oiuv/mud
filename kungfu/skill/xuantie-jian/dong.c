#include <ansi.h>
#include <combat.h>

#define DONG "「" HIG "大江东去" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        int damage;
        int ap, dp;
        string wp, msg;

        if (userp(me) && ! me->query("can_perform/xuantie-jian/dong"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(DONG "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" DONG "。\n");

        if ((int)me->query_skill("force") < 400)
                return notify_fail("你的内功火候不够，难以施展" DONG "。\n");

        wp = weapon->name();

        if ((int)me->query_skill("xuantie-jian", 1) < 200)
                return notify_fail("你的玄铁剑法不够娴熟，难以施展" DONG "。\n");

        if ((int)weapon->query_weight() < 25000
            && ! weapon->is_item_make())
                return notify_fail("你手中的" + wp + "分量不够，难以施展" DONG "。\n");

        if ((int)me->query("neili") < 1000)
                return notify_fail("你现在的内力不足，难以施展" DONG "。\n");

        if (me->query_skill_mapped("sword") != "xuantie-jian")
                return notify_fail("你没有激发玄铁剑法，难以施展" DONG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "暗自凝神，顿时一股气劲由身后澎湃迸发，接着单"
              "手一振，手中" + wp + HIW "\n随即横空卷出，激得周围尘沙腾起"
              "，所施正是玄铁剑法「" HIG "大江东去" HIW "」。\n"NOR;

        me->start_busy(2 + random(2));

        ap = me->query_skill("sword") + me->query_str() * 5;
        dp = target->query_skill("force") + target->query_str() * 5;

        if (me->query("character") == "光明磊落" || me->query("character")=="国土无双" )
                ap += ap / 5;
        if (ap / 2 + random(ap) > dp)
        {
                target->start_busy(1);
                damage = ap + random(ap);
                me->add("neili", -800);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 120,
                                           HIR "结果$n" HIR "奋力招架，却被$N" HIR
                                           "这一剑震的飞起，口中鲜血狂吐不止！\n" NOR);
        } else
        {
                msg += CYN "可是$n" CYN "看破了$N"
                       CYN "的企图，急忙斜跃避开。\n"NOR;
                me->add("neili", -500);
        }
        message_combatd(msg, me, target);

        return 1;
}


