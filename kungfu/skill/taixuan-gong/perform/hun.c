#include <ansi.h>
#include <combat.h>
 
inherit F_SSERVER;

#define HUN "「" HIW "混天一气" NOR "」"

string final(object me, object target, int damage);

int perform(object me, object target)
{
        string msg;
        int ap, dp;
        int damage;

        if (userp(me) && ! me->query("can_perform/taixuan-gong/hun"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)target = me->select_opponent();

        if (! target || ! me->is_fighting(target))
                return notify_fail(HUN "只能对战斗中的对手使用。\n");
 
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(HUN "只能空手施展。\n");

        if (me->query_skill("taixuan-gong", 1) < 200)
                return notify_fail("你的太玄功还不够娴熟，难以施展" HUN "。\n");

        if (me->query_skill_mapped("unarmed") != "taixuan-gong")
                return notify_fail("你现在没有激发太玄功为拳脚，难以施展" HUN "。\n");

        if (me->query_skill_mapped("force") != "taixuan-gong")
                return notify_fail("你现在没有激发太玄功为内功，难以施展" HUN "。\n");

        if (me->query_skill_prepared("unarmed") != "taixuan-gong")
                return notify_fail("你现在没有准备使用太玄功，难以施展" HUN "。\n");

        if (me->query("neili") < 600)
                return notify_fail("你的内力不够，难以施展" HUN "。\n");
 
        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIG "\n$N" HIG "双手合十，双目微闭，太玄奥义自心底涌出，猛然间，$N"
              HIG "双手向前推出，一股强劲的气流袭向$n " HIG "。\n" NOR;
 
        ap = me->query_skill("taixuan-gong", 1) * 2 + me->query("con") * 10 +
             me->query_skill("martial-cognize", 1);

        dp = target->query_skill("force") + target->query("con") * 10 +
             target->query_skill("martial-cognize", 1);

        me->add("neili", -300);

        if (ap / 2 + random(ap) < dp)
        {
                msg += HIY "然而$n" HIY "全力抵挡，终于将$N" HIY
                       "发出的气流挡住。\n" NOR;
	        me->start_busy(2);
        } else
        {
                me->add("neili", -300);
	        me->start_busy(3);
                damage = ap + random(ap);
                target->add("neili", -(me->query_skill("taixuan-gong", 1) + 
                            random(me->query_skill("taixuan-gong", 1))), me);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 80 + random(5),
                                           (: final, me, target, damage :));

        }
        message_sort(msg, me, target);
        return 1;
}


string final(object me, object target, int damage)
{
        target->receive_damage("jing", damage / 2, me);
        target->receive_wound("jing", damage / 3, me);
        target->busy(1);
        return  HIR "$n" HIR "急忙飞身后退，可是气流射"
                "得更快，只听$p" HIR "一声惨叫，一股气"
                "流已经透体而过，鲜血飞溅！$n" HIR "顿"
                "觉精力涣散，无法集中。\n" NOR;
}