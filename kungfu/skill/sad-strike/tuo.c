// tuo.c
// 杨过决战金轮法王时所施展的决定胜负
// 的一招。

#include <ansi.h>
#include <combat.h>

#define TUO "「" HIM "拖泥带水" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp;
        int effqi, maxqi;
        string couple;

        if (userp(me) && ! me->query("can_perform/sad-strike/tuo"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(TUO "只能对战斗中的对手使用。\n");

        if (me->query("static/marry") > 1)
                return notify_fail("你感情早已不纯，哪里还能领略到那种黯然销魂的感觉？\n");

        if ((int)me->query_skill("force") < 360)
                return notify_fail("你的内功火候不够，使不出" TUO "。\n");

        if ((int)me->query_skill("sad-strike", 1) < 180)
                return notify_fail("你的黯然销魂掌不够熟练，不会使用" TUO "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你的真气不够，无法使用" TUO "。\n");

        if (me->query_skill_prepared("unarmed") != "sad-strike")
                return notify_fail("你没有准备黯然销魂掌，无法使用" TUO "。\n");

        if (! stringp(couple = me->query("couple/id")))
                return notify_fail("你没有妻子，体会不到这种万念俱灰的感觉。\n");

        if (time() - me->query_temp("last_perform/sad-strike/tuo") < 60)
                return notify_fail("你刚刚施展完" TUO "，现在心情没有那么郁闷了。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        effqi = me->query("eff_qi");
        maxqi = me->query("max_qi");

        ap = me->query_skill("unarmed") + me->query_skill("force");
        dp = target->query_skill("parry") + target->query_skill("force");
        me->start_busy(2 + random(2));

        if (random(5) == 1 && me->query("max_neili") > 5000)
        {
                msg = HIR "\n$N" HIR "心下万念俱灰，凄然间回想到自己的妻子" HIW
                      + me->query("couple/name") + HIR "，" HIR "心中暗道：“别了！"
                      "你自己保重。”当下失魂落魄，随手一招，恰好使出了黯"
                      "然销魂掌中的「拖泥带水」。\n" NOR;
                ap += ap * 10 / 100;
        } else
        {
                msg = HIM "\n只见$N" HIM "没精打采的挥袖卷出，面无表情，随意拍出一掌，正是"
                      "黯然销魂掌中的「拖泥带水」。\n"NOR;
        }
        if (ap * 3 / 5 + random(ap) > dp)
        { 
                damage = ap + random(ap / 2);
                me->add("neili", -400);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 120,
                                           HIR "只听$n" HIR "一声闷哼，“噗”的一"
                                           "声，这一掌正好击在$p" HIR "肩头。 "
                                           NOR);
                me->set_temp("last_perform/sad-strike/tuo", time());
        } else
        {
                me->add("neili", -200);
                msg += HIC "可是$p" HIC "小心应付、奋力招架，挡开了这一招。\n"
                       NOR;
        }
        message_sort(msg, me, target);
        return 1;
}

