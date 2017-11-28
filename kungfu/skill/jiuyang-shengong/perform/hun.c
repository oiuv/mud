#include <ansi.h>
#include <combat.h>
 
inherit F_SSERVER;

#define HUN "「" HIR "混沌一阳" NOR "」"

int perform(object me, object target)
{
        string msg;
        int ap, dp;
        int damage;

        if (userp(me) && ! me->query("can_perform/jiuyang-shengong/hun"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(HUN "只能对战斗中的对手使用。\n");
 
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(HUN "只能空手施展。\n");

        if (me->query_skill("jiuyang-shengong", 1) < 180)
                return notify_fail("你的九阳神功还不够娴熟，难以施展" HUN "。\n");

        if (me->query_skill_mapped("unarmed") != "jiuyang-shengong")
                return notify_fail("你现在没有激发九阳神功为拳脚，难以施展" HUN "。\n");

        if (me->query_skill_mapped("force") != "jiuyang-shengong")
                return notify_fail("你现在没有激发九阳神功为内功，难以施展" HUN "。\n");

        if (me->query_skill_prepared("unarmed") != "jiuyang-shengong")
                return notify_fail("你现在没有准备使用九阳神功，难以施展" HUN "。\n");

        if (me->query("neili") < 300)
                return notify_fail("你的内力不够，难以施展" HUN "。\n");
 
        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "跨前一步，双手回圈，颇得太极之意。掌心顿时闪"
              "出一个气团，向$n" HIR "电射而去。\n" NOR;
 
        ap = me->query_skill("jiuyang-shengong", 1) * 2 + me->query("con") * 10 +
             me->query_skill("martial-cognize", 1);
        dp = target->query_skill("force") + target->query("con") * 10 +
             target->query_skill("martial-cognize", 1);

        me->add("neili", -50);

        if (ap / 2 + random(ap) < dp)
        {
                msg += HIY "然而$n" HIY "全力抵挡，终于将$N" HIY
                       "发出的气团拨开。\n" NOR;
	        me->start_busy(3);
        } else
        {
                me->add("neili", -200);
	        me->start_busy(1);
                damage = ap / 2 + random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 50,
                                           HIR "$n" HIR "急忙抽身后退，可是气团射"
                                           "得更快，只听$p" HIR "一声惨叫，鲜血飞"
                                           "溅！\n" NOR);
        }
        message_combatd(msg, me, target);
        return 1;
}
