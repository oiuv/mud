#include <ansi.h>
#include <combat.h>

#define TIAN "「" HIC "天外清音" NOR "」"

inherit F_SSERVER;

int perform(object me)
{
        string msg;
        object weapon, target;
        int skill, ap, dp/*, neili_wound*/, qi_wound;

        if (userp(me) && ! me->query("can_perform/yuxiao-jian/tian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

	if (! target || ! me->is_fighting(target))
                return notify_fail(TIAN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" TIAN "。\n");

        if (me->query_skill_mapped("sword") != "yuxiao-jian")
                return notify_fail("你没有激发玉箫剑法，难以施展" TIAN "。\n");

        skill = me->query_skill("yuxiao-jian", 1);

        if (skill < 120)
                return notify_fail("你玉箫剑法等级不够，难以施展" TIAN "。\n");

        if ((int)me->query_skill("bibo-shengong", 1) < 120)
                return notify_fail("你碧波神功修为不够，难以施展" TIAN "。\n");

        if (me->query("neili") < 1000)
                return notify_fail("你现在的真气不足，难以施展" TIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIC "$N" HIC "一声清啸，手中" + weapon->name() +
              HIC "剑发琴音，闪动不止，剑影如夜幕般扑向$n" HIC "。\n" NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("force");

        if (dp < 1) dp = 1;
        if (ap / 2 + random(ap) > dp)
        {
                me->add("neili", -120);
                qi_wound = (int)me->query_skill("sword") +
                           (int)me->query_skill("bibo-shengong", 1);
                qi_wound = qi_wound / 2 + random(qi_wound / 2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, qi_wound, 66,
                                           HIR "$n" HIR "顿时觉得眼前金光乱闪动，双耳嗡嗡"
                                           "内鸣，全身便如针扎一般！\n" NOR);
                me->start_busy(1 + random(3));
        } else
        {
                me->add("neili", -50);
                msg += CYN "可是$n" CYN "宁心静气，随手挥洒，将$N"
                       CYN "的招数撇在一边。\n"NOR;
                me->start_busy(2);
        }
        message_combatd(msg, me, target);
        return 1;
}