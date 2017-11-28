#include <ansi.h>
#include <combat.h>
#include "/kungfu/skill/eff_msg.h";

#define CANHE "「" HIW "参合剑气" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp, slv, clv,p;

        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/canhe-zhi/canhe"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(CANHE "只能对战斗中的对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail("你必须空手才能使用" CANHE "。\n");

        if (clv = (int)me->query_skill("canhe-zhi", 1) < 180)
                return notify_fail("你的参合指修为有限，难以施展" CANHE "。\n");

        if (me->query_skill_prepared("finger") != "canhe-zhi")
                return notify_fail("你现在没有准备使用参合指，难以施展" CANHE "。\n");

        if ((int)me->query_skill("force") < 320)
                return notify_fail("你的内功修为太差，难以施展" CANHE "。\n");

        if ((int)me->query("max_neili") < 6000)
                return notify_fail("你的内力修为不足，难以施展" CANHE "。\n");

        if ((int)me->query("neili") < 900)
                return notify_fail("你的真气不够，难以施展" CANHE "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        damage = me->query_skill("finger") + me->query_skill("force");
        damage += random(damage);
        slv = target->query_skill("liumai-shenjian", 1);

        ap = me->query_skill("finger");
        dp = target->query_skill("dodge");

        msg = HIW "只见$N" HIW "十指分摊，霎时破空声骤响，数股剑气至指尖激"
              "射而出，朝$n" HIW "径直奔去！\n" NOR;

        me->start_busy(3 + random(3));

        if (slv >= 140 
            && random(5) == 0 
            && slv >= clv - 60 // 如果参合指等级比六脉神剑等级高60级以上取消特殊效果
            &&! target->is_busy()
            && target->query_skill_prepared("finger") == "liumai-shenjian")
        {
                msg += HIY "\n但见$n" HIY "斜斜一指点出，指出如风，剑气纵横，嗤然"
                       "作响，竟将$N" HIY "的剑气全部折回，反向自己射去！\n" NOR +
                       HIR "你听到「嗤啦」一声轻响，脸上竟溅到一些血滴！\n" NOR;

                me->receive_wound("qi", slv / 3 + random(slv / 4), target);
                p = (int)me->query("qi") * 100 / (int)me->query("max_qi");
                msg += "( $N" + eff_status_msg(p) + ")\n";

        } else
        if (ap * 3 / 4 + random(ap) > dp)
        { 
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 64,
                                           HIR "\n顿时只听“嗤啦”的一声，$n" HIR
                                           "躲闪不及，剑气顿时穿胸而过，带出一蓬"
                                           "血雨。\n" NOR);
        } else
        {
                msg += CYN "\n$n" CYN "见$N" CYN "来势汹涌，急忙飞身一跃而"
                       "起，避开了这一击。\n" NOR;
        }

        ap = me->query_skill("finger");
        dp = target->query_skill("force");

        if (slv >= 160 
            && random(8) == 0 
            && slv >= clv - 60  // 如果参合指等级比六脉神剑等级高60级以上取消特殊效果
            &&! target->is_busy() 
            && target->query_skill_prepared("finger") == "liumai-shenjian")
        {
                msg += HIY "\n忽见$n" HIY "左手小指一伸，一招「少泽剑」至指尖透出"
                       "，真气鼓荡，轻灵迅速，顿将$N" HIY "剑气逼回！\n" NOR + HIR
                       "你听到「嗤啦」一声轻响，脸上竟溅到一些血滴！\n" NOR;

                me->receive_wound("qi", slv / 2 + random(slv / 4), target);
                p = (int)me->query("qi") * 100 / (int)me->query("max_qi");
                msg += "( $N" + eff_status_msg(p) + ")\n";

        } else
        if (ap * 3 / 4 + random(ap) > dp)
        { 
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 75,
                                           HIR "\n只听$n" HIR "一声惨嚎，被$N" HIR
                                           "的剑气刺中了要害，血肉模糊，鲜血迸流不"
                                           "止。\n" NOR);
        } else
        {
                msg += CYN "\n$n" CYN "见$N" CYN "来势汹涌，急忙飞身一跃而"
                       "起，避开了这一击。\n" NOR;
        }

        ap = me->query_skill("finger");
        dp = target->query_skill("parry");

        if (slv >= 180 
            && random(10) == 0 
            && slv >= clv - 50  // 如果参合指等级比六脉神剑等级高50级以上取消特殊效果
            &&! target->is_busy()
            && target->query_skill_prepared("finger") == "liumai-shenjian")
        {
                msg += HIY "\n可电光火石之间，$n" HIY "猛然翻掌，右手陡然探出，中"
                       "指「中冲剑」向$N" HIY "一竖，登将参合剑气化于无形！\n" NOR
                       + HIR "你听到「嗤啦」一声轻响，脸上竟溅到一些血滴！\n" NOR;

                me->receive_wound("qi", slv / 2 + random(slv / 2), target);
                p = (int)me->query("qi") * 100 / (int)me->query("max_qi");
                msg += "( $N" + eff_status_msg(p) + ")\n";
                me->start_busy(6);

        } else
        if (ap * 2 / 3 + random(ap) > dp)
        { 
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 100,
                                           HIR "\n$n" HIR "奋力招架，仍是不敌，$N"
                                           "的" HIR "无形剑气已透体而入，鲜血飞射"
                                           "，无力再战。\n" NOR);
        } else
        {
                msg += CYN "\n$n" CYN "见$N" CYN "来势汹涌，急忙飞身一跃而"
                       "起，避开了这一击。\n" NOR;
        }
        me->add("neili", -400 - random(100));
        message_combatd(msg, me, target);
        return 1;
}
