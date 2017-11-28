// wanshi.c 灵蛇杖法「千蛇万噬」
// by jeeny

#include <ansi.h>
#include <combat.h>

//#define LINGSHE_ZHANG    "/clone/weapon/lingshe"
#define LINGSHE_ZHANG    "d/baituo/obj/lingshezhang"

inherit F_SSERVER;

string final(object me, object target, int damage, object weapon);

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;
        
        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/lingshe-zhangfa/wanshi"))
                return notify_fail("你还不会使用「千蛇万噬」这一绝技。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail("「千蛇万噬」只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "staff")
                return notify_fail("你使用的武器不对。\n");


        if ((int)me->query_skill("lingshe-zhangfa", 1) < 160)
                return notify_fail("你的灵蛇杖法不够娴熟，不会使用「千蛇万噬」。\n");

        if (me->query("neili") < 400)
                return notify_fail("你现在真气不够，无法使用「千蛇万噬」。\n");

        if (me->query_skill_mapped("staff") != "lingshe-zhangfa") 
                return notify_fail("你没有激发灵蛇杖法，无法使用「千蛇万噬」！\n");

        if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIB "$N" HIB "手持" + weapon->name() + HIB "，直捣$n中宫" HIB "。\n" NOR;

        ap = me->query_skill("staff");
        dp = target->query_skill("parry");
        
        if (target->is_good()) ap += ap / 10;

        me->start_busy(2 + random(4));
        if (ap / 3 + random(ap) > dp)
        {
                damage = ap + random(ap / 4);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,
                                           (: final, me, target, damage, weapon :));
                me->add("neili", -350);
                if (LINGSHE_ZHANG->query("poison_applied") > 0 && weapon == find_object("/d/baituo/obj/lingshezhang"))
                {
                        target->apply_condition("snake_poison", ap / 2, me);
                        LINGSHE_ZHANG->add("poison_applied", -1);
                }
        } else
        {
                msg += HIG "可是$p" HIG "看破了$P" HIG "的企图，一"
                       "缩胸，急退三步，避开了这一招。\n" NOR;
                me->add("neili", -100);
        }
        message_combatd(msg, me, target);

        return 1;
}

string final(object me, object target, int damage, object weapon)
{
        target->receive_damage("jing", damage / 4, me);
        target->receive_wound("jing", damage / 8, me);
        return HIW "哪知" HIW + weapon->name() + HIW "突然拐弯，绕到$p" HIW "背后，"
                "重重地击在了$p" HIW "的颈脖子上！\n"
                HIB "$p" HIB "“噗”地吐出一口鲜血，随"
                HIB "即只觉脖颈一阵麻痒。\n" NOR;
}
