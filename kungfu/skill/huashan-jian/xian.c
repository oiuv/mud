// feilong.c 华山剑法「夺命连环三仙剑」

#include <ansi.h>
#include <combat.h>

#define XIAN "「" HIM "夺命连环三仙剑" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        object weapon;
        int ap, dp, fp, pp;

        if (userp(me) && ! me->query("can_perform/huashan-jian/xian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(XIAN "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对！\n");

        if ((int)me->query_skill("huashan-jian", 1) < 160)
                return notify_fail("你华山剑法不够娴熟，无法施展" XIAN "。\n");

        if ((int)me->query_skill("dodge", 1) < 160)
                return notify_fail("你轻功修为不够，无法施展" XIAN "。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你现在真气不够，无法施展" XIAN "！\n");

        if (me->query_skill_mapped("sword") != "huashan-jian")
                return notify_fail("你没有激发华山剑法，无法使用" XIAN "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        me->add("neili", -280);

        ap = me->query_skill("sword");
        dp = target->query_skill("dodge");
        fp = target->query_skill("force");
        pp = target->query_skill("parry");

        message_sort(HIW "\n$N" HIW "长啸一声，手中" + weapon->name() + HIW "随即不停转动，汹涌而"
                        "出，正是华山剑宗绝技「" HIM "夺命连环三仙剑" HIW "」，但是" + weapon->name() + HIW 
                        "剑锋突变，一剑顿时化为三剑，袭向$n" HIW "……\n" NOR, me, target);        

        msg = HIM "$N" HIM "将内力全都运到了剑上，呼的一剑，当头直劈。\n" NOR;
        if (ap / 2 + random(ap) < dp)
                msg += CYN "$n" CYN "斜身闪开。\n" NOR;
        else
        {
                damage = ap + random(ap / 3);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 40 + random(10),
                                           HIR "$n" HIR "急忙后退，竟然躲避不及，被$N"
                                           HIR "这一剑震得口吐鲜血，接连后退。\n" NOR);
        }

        msg += HIM "\n$N" HIM "圈转" + weapon->name() + HIM "，拦腰横削，剑势恢弘，剑气纵横，令人匪夷所思。\n" NOR;
        if (ap / 2 + random(ap) < fp)
                msg += CYN "$n" CYN "纵身从剑上越过。\n" NOR;
        else
        {
                damage = ap + random(ap / 3);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50 + random(10),
                                           HIR "此招来势当真快极，$n" HIR "哪里来得及闪"
                                           "避招架？只见$N" HIR "剑光闪过，$n"
                                           HIR "腰间霎时鲜血淋漓！\n" NOR);
        }

        msg += HIM "\n$N" HIM "长剑反撩，疾刺$p" HIM "后心，剑法之快，部位之准，当真闻所未闻。\n" NOR;
        if (ap / 2 + random(ap) < pp)
                msg += CYN "$n" CYN "身在空中，不及变招，只能挥出一招，正击中$N"
                       CYN "剑上，略一借力，飘然避去。\n" NOR;
        else
        {
                damage = ap + random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 60 + random(10),
                                           HIR "$n" HIR "身在空中，哪里来得及变招？只见$N"
                                           HIR "此剑掠过，$n" HIR "大声惨呼，鲜血四下飞溅！\n" NOR);
        }

        me->start_busy(3);
        message_combatd(msg, me, target);
        return 1;
}
