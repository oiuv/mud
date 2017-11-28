// zhua.c 九阴白骨爪 - 九阴神抓

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;
#define ZHUA "「" HIG "九阴神爪" NOR "」"

int perform(object me, object target)
{
        int damage;
        string msg;
        string pmsg;
        string *limbs;
        string  limb;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/jiuyin-baiguzhao"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZHUA "只能对战斗中的对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail("你必须空手才能使用九阴神抓！\n");
                
        if ((int)me->query_skill("jiuyin-baiguzhao", 1) < 120)
                return notify_fail("你的九阴白骨爪还不够娴熟，不能使用" ZHUA "。\n");

        if (me->query_skill_prepared("claw") != "jiuyin-baiguzhao")
                return notify_fail("你没有准备九阴白骨爪，无法使用" ZHUA "。\n");
                                
        if ((int)me->query("neili", 1) < 240)
                return notify_fail("你现在内力太弱，不能使用九阴神抓。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "冷笑一声，眼露凶光，右手成爪，三盘两旋虚虚"
              "实实的向$n" HIR "的头顶抓了下来。\n" NOR;

        me->add("neili", -50);

        me->want_kill(target);
        ap = me->query_skill("claw");
        dp = target->query_skill("dodge");
        if (ap / 2 + random(ap * 2 / 3) > dp)
        {
                me->start_busy(2);
                me->add("neili", -180);
                damage = 0;

                if (me->query("max_neili") < target->query("max_neili") * 4 / 5 &&
                    me->query_skill("force") < target->query_skill("force"))
                        msg += HIY "“啪”的一声$N" HIY "正抓在$n" HIY "的天灵盖上，"
                               "结果震得“哇哇”怪叫了两声！\n" NOR;
                else
                if (me->query("max_neili") > target->query("max_neili") * 2)
                {
                        msg += HIY "“扑哧”一声，$N" HIY "五指正插入$n" HIY "的天灵"
                               "盖，$n" HIY "一声惨叫，软绵绵的瘫了下去。\n" NOR;
                        damage = -1;
                } else
                {
                        target->start_busy(1 + random(3));
        
                        damage = ap + (int)me->query_skill("force");
                        damage = damage / 2 + random(damage / 2);
                        
                        if (arrayp(limbs = target->query("limbs")))
                                limb = limbs[random(sizeof(limbs))];
                        else
                                limb = "要害";
                        pmsg = HIC "$n连忙腾挪躲闪，然而“扑哧”一声，$N"
                               HIC "五指正插入$n" HIC "的" + limb + "，$n"
                               HIC "一声惨叫，血射五步。\n" NOR;
                        msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 70, pmsg);
                }
        } else 
        {
                me->start_busy(2);
                msg += CYN "可是$p" CYN "看破了$P"
                       CYN "的企图，身形急动，躲开了这一抓。\n" NOR;
        }

        message_combatd(msg, me, target);

        if (damage < 0)
                target->die(me);
        else
        if (! target->is_killing(me))
                target->kill_ob(me);

        return 1;
}

