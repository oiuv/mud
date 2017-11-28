#include <ansi.h>
#include <combat.h>

#define GUI "「" HIR "归去来兮" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        object weapon;
//      string wname;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/wudoumi-shengong/gui"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(GUI "只能对战斗中的对手使用。\n");

        if (objectp(weapon = me->query_temp("weapon")))
                return notify_fail("只有空手才能施展" GUI "。\n");

        if (me->query_skill("force") < 200)
                return notify_fail("你的内功修为不够，难以施展" GUI "。\n");

        if ((int)me->query_skill("wudoumi-shengong", 1) < 140)
                return notify_fail("你的五斗米神功不够娴熟，难以施展" GUI "。\n");

        if ((int)me->query("neili") < 800)
                return notify_fail("你现在真气不够，难以施展" GUI "。\n");

        if (me->query_skill_mapped("force") != "wudoumi-shengong")
                return notify_fail("你没有激发五斗米神功为内功，难以施展" GUI "。\n");

        if (me->query_skill_mapped("unarmed") != "wudoumi-shengong")
                return notify_fail("你没有激发五斗米神功为拳脚，难以施展" GUI "。\n");

        if (me->query_skill_prepared("unarmed") != "wudoumi-shengong")
                return notify_fail("你现在没有准备使用五斗米神功，难以施展" GUI "。\n");

        if (! me->query_temp("powerup"))
                return notify_fail("你未将全身功力尽数提起，难以施展" GUI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        

        ap = me->query_skill("force") + me->query("con") * 10;
        dp = target->query_skill("dodge") + target->query("dex") * 10;
        
        damage = (int)me->query_skill("wudoumi-shengong", 1);
        damage += random(damage);

        msg = HIR "$N" HIR "一声断喝，双掌施出五斗米神功「归去来兮」绝技，顿时掌"
              "劲澎湃，涌向$n" HIR "。\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 60,
                                           HIR "$p" HIR "急忙奋力格挡，可只一瞬间"
                                           "，$P" HIR "的掌劲已透体而入，接连震断"
                                           "数根肋骨！\n" NOR);
        } else
        {
                msg += CYN "$p" CYN "见$P" CYN "来势汹涌，不敢硬接"
                       "，只得小巧腾挪，躲闪开来。\n" NOR;
        }

        ap = me->query_skill("force") + me->query("con") * 10;
        dp = target->query_skill("dodge") + target->query("dex") * 10;

        msg += "\n" HIR "紧接着只见$N" HIR "双手陡然回圈，竟使已袭出的掌劲倒回"
               "，从$n" HIR "身后再度席卷而归。\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 70,
                                           HIR "$p" HIR "大惊之下，竟然僵直而立，$P"
                                           HIR "澎湃的掌劲顿时穿透胸膛，尽伤五脏六"
                                           "腑！\n" NOR);
        } else
        {
                msg += CYN "$p" CYN "大惊之下急忙飞身跃起，终于躲开"
                       "了这神鬼莫测的一击。\n" NOR;
        }
        me->start_busy(2 + random(3));
        me->add("neili", -500);
        message_combatd(msg, me, target);
        return 1;
}