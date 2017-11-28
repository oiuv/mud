#include <ansi.h>
#include <combat.h>

#define XUE "「" HIR "祭血神刀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
        int ap, dp, damage;

        if (userp(me) && ! me->query("can_perform/xuedao-dafa/xue"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(XUE "只能对战斗中的对手使用。\n");
 
        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对，难以施展" XUE "。\n");

        if ((int)me->query_skill("force") < 220)
                return notify_fail("你的内功火候不够，难以施展" XUE "。\n");

        if ((int)me->query_skill("xuedao-dafa", 1) < 160)
                return notify_fail("你的血刀大法还不到家，难以施展" XUE "。\n");

        if (me->query_skill_mapped("force") != "xuedao-dafa")
                return notify_fail("你没有激发血刀大法为内功，难以施展" XUE "。\n");

        if (me->query_skill_mapped("blade") != "xuedao-dafa")
                return notify_fail("你没有激发血刀大法为刀法，难以施展" XUE "。\n");

        if ((int)me->query("qi") < 100)
                return notify_fail("你目前气血翻滚，难以施展" XUE "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你目前真气不足，难以施展" XUE "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        ap = me->query_skill("blade");
        dp = target->query_skill("parry");

        msg = HIR "$N" HIR "挥刀向左肩一勒，血珠顿时溅满刀面，紧接着右臂"
              "抡出一片血光向$n" HIR "当头劈落。\n" NOR;

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap / 2);
                me->add("neili", -150);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 80,
                                           HIR "$n" HIR "只见血刀疾闪，眼前一阵血"
                                           "红，刀刃劈面而下，鲜血飞溅，不禁惨声"
                                           "大嚎！\n" NOR);
        } else
        {
                me->start_busy(2);
                msg += CYN "可是$n" CYN "侧身避让，不慌不忙，躲过了$N"
                       CYN "的必杀一刀。\n"NOR;
                me->add("neili", -100);
        }
        me->receive_wound("qi", 50);
        message_combatd(msg, me, target);
        return 1;
}
