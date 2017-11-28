#include <ansi.h>
#include <combat.h>

#define PO "「" HIC "破穹" HIW "云" HIC "蛟" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        object weapon;
        string wname;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/qixing-shou/po"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(PO "只能对战斗中的对手使用。\n");

        if (objectp(weapon = me->query_temp("weapon")))
                return notify_fail("只有空手才能施展" PO "。\n");

        if ((int)me->query_skill("qixing-shou", 1) < 150)
                return notify_fail("你七星分天手不够娴熟，难以施展" PO "。\n");

        if (me->query_skill_mapped("hand") != "qixing-shou")
                return notify_fail("你没有激发七星分天手，难以施展" PO "。\n");

        if (me->query_skill_prepared("hand") != "qixing-shou")
                return notify_fail("你没有准备七星分天手，难以施展" PO "。\n");

        if (me->query_skill("force") < 200)
                return notify_fail("你的内功修为不够，难以施展" PO "。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你现在的真气不足，难以施展" PO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        damage = (int)me->query_skill("qixing-shou", 1) / 2;
        damage += random(damage);

        ap = me->query_skill("hand");
        dp = target->query_skill("parry");
        msg = HIC "$N" HIC "双目圆睁，单手陡然一振，袖底顿时窜出一道" NOR + MAG
              "紫光" HIC "，直射$n" HIC "前胸。\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 20,
                                           HIR "但见$P" HIR "这道气劲来势迅猛之极"
                                           "，$n" HIR "如何避得，顿时被紫劲震开了"
                                           "数尺！\n" NOR);
        } else
        {
                msg += CYN "$p" CYN "见势不妙，急忙向后纵开数尺，避开了$P"
                       CYN "这招。\n" NOR;
        }

        ap = me->query_skill("hand");
        dp = target->query_skill("dodge");
        msg += "\n" HIC "紧接着$N" HIC "左掌蓦的一抬，凭空虚划了道" HIY "弧芒" HIC
               "，至上而下反推$n" HIC "后颈。\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 25,
                                           HIR "$p" HIR "只觉后颈一麻，已被$N" HIR
                                           "这招击个正中，顿时全身瘫软，呕出一口鲜"
                                           "血！\n" NOR);
        } else
        {
                msg += CYN "可是$p" CYN "丝毫不为$P"
                       CYN "所动，奋力格挡，稳稳将这一招架开。\n" NOR;
        }

        ap = me->query_skill("hand");
        dp = target->query_skill("force");
        msg += "\n" HIC "便在此时，却见$N" HIC "双掌猛然回圈，平推而出，顿时层层"
               HIW "气浪" HIC "直袭$n" HIC "。\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 30,
                                           HIR "$p" HIR "在$N" HIR "的猛攻之下，已"
                                           "再无余力招架，竟被这一掌震得飞起，摔了"
                                           "出去！\n" NOR);
        } else
        {
                msg += CYN "然而$p" CYN "沉身聚气，奋力一格，便将$P"
                       CYN "这掌驱于无形。\n" NOR;
        }
        me->start_busy(2 + random(3));
        me->add("neili", -200);
        message_combatd(msg, me, target);
        return 1;
}
