// ziwu.c 九阴白骨爪 - 夺命连环爪

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

#define ZHUA "「" HIW "夺命连环爪" NOR "」"

int perform(object me, object target)
{
        int damage;
        string msg;
//      string pmsg;
//      string *limbs;
//      string  limb;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/jiuyin-baiguzhao/duo"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZHUA "只能对战斗中的对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail("你必须空手才能使用" ZHUA "！\n");
                
        if ((int)me->query_skill("jiuyin-baiguzhao", 1) < 140)
                return notify_fail("你的九阴白骨爪还不够娴熟，不能使用" ZHUA "。\n");

        if (me->query_skill_prepared("claw") != "jiuyin-baiguzhao")
                return notify_fail("你没有准备九阴白骨爪，无法使用" ZHUA "。\n");

        if ((int)me->query("neili", 1) < 300)
                return notify_fail("你现在内力太弱，不能使用夺命连环爪。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        switch (me->query("character"))
        {
        case "心狠手辣":
                msg = HIR "$N" HIR "桀桀怪笑，手指微微弯曲，倏的冲$n"
                      HIR "头顶抓下。\n" NOR;
                break;

        case "阴险奸诈":
                msg = HIR "$N" HIR "冷笑数声，手指微微弯曲成爪，飞向$n"
                      HIR "头顶抓下。\n" NOR;
                break;

        case "光明磊落":
                msg = HIR "$N" HIR "扬声吐气，手指微微弯曲成爪，奋力向$n"
                      HIR "头顶抓下。\n" NOR;
                break;

        default:
                msg = HIR "$N" HIR "手指微微弯曲成爪，浑不经意的向$n"
                      HIR "头顶抓下。\n" NOR;
                break;
        }

        me->add("neili", -100);

        ap = me->query_skill("claw");
        dp = target->query_skill("parry");

        damage = ap + me->query_skill("force");
        damage = damage / 3 + random(damage / 3);
        if (ap / 2 + random(ap) > dp)
        {
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 55,
                                           HIR "$p" HIR "急忙闪头，然而$N" HIR
                                           "这招来得好快，正插中$p" HIR "肩头，"
                                           "登时鲜血淋漓。\n" NOR);
        } else 
        {
                me->add("neili", -150);
                me->start_busy(3);
                msg += HIC "$p" HIC "暗叫不好，急忙闪头，可是$N"
                       HIC "手臂咔咔作响，忽然暴长，迅论无比的抓向$p。\n" NOR;
                dp = target->query_skill("dodge");

                if (ap * 11 / 20 + random(ap) > dp)
                {
                        msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 65,
                                                   HIR "$n" HIR "哪里料到$N" HIR
                                                   "竟有如此变招，不及躲闪，肩头被$P"
                                                   HIR "抓了个鲜血淋漓。\n" NOR);
                } else
                        msg += CYN "$n" CYN "不及多想，急切间飘然而退，让$P"
                               CYN "这一招无功而返。\n" NOR;
        }

        message_combatd(msg, me, target);
        return 1;
}
