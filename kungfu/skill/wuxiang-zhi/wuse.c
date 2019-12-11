// wuse.c  无色无相

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
        // object weapon; 
        string msg;
        int ap, dp;
        int damage;

        //if (userp(me) && ! me->query("can_perform/wuxiang-zhi/wuse"))
        //        return notify_fail("你还没有受过高人指点，无法施展「无色无相」。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail("「无色无相」只能在战斗中对对手使用。\n");

        if (me->query_temp("weapon") ||
            me->query_temp("secondary_weapon"))
                return notify_fail("你必须空手才能使用「无色无相」！\n");

       // if ((me->query_skill_mapped("force") != "hunyuan-yiqi") && (me->query_skill_mapped("force") != "yijinjing") && (me->query_skill_mapped("force") != "luohan-fumogong"))
       //         return notify_fail("你现在没有激发少林内功为内功，难以施展「无色无相」。\n");

        if (me->query_skill("force") < 200)
                return notify_fail("你的内功的修为不够，不能使用这一绝技！\n");

        if (me->query_skill("wuxiang-zhi", 1) < 150)
                return notify_fail("你的无相指修为不够，目前不能使用「无色无相」！\n");

        if (me->query("neili") < 400)
                return notify_fail("你的真气不够，无法使用「无色无相」！\n");

        if (me->query_skill_mapped("finger") != "wuxiang-zhi")
                return notify_fail("你没有激发无相指，不能使用「无色无相」！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "聚起全身功力，汇聚于右指，纵身而上，"
              HIY "向$n扑去，同时一指划出，如同流星一般击向$n" + HIY "！\n" NOR;

        ap = me->query_skill("finger") + me->query_skill("force");
        dp = target->query_skill("dodge") + target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap / 2);
                me->add("neili", -200);
                me->start_busy(2);

                msg += HIR "只见$p" HIR "一声惨叫，已被点中胸口要穴，"
                       "$p" HIR "只觉得胸口气血汹涌，全身气血"
                       "倒流，哇的一声吐出一口鲜血，苦不堪言！\n" NOR;
		msg += COMBAT_D->do_damage(me, target, REMOTE_ATTACK, damage, 60);
        } else
        {
                me->add("neili", -100);
                me->start_busy(3);
                msg += CYN "可是$p" CYN "看破了$N" CYN "的企图，轻轻"
                       CYN "向后飘出数丈，躲过了这一致命的一击！\n"NOR;
        }
                message_combatd(msg, me, target);

                return 1;
}
