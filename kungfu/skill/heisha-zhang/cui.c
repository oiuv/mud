#include <ansi.h>
#include <combat.h>

#define CUI "「" HIB "催魂掌" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp;
        int lvl;

        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/heisha-zhang/cui"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(CUI "只能对战斗中的对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail("你必须空手才能使用" CUI "。\n");

        if (me->query_skill_mapped("strike") != "heisha-zhang")
                return notify_fail("你没有激发黑砂掌，难以施展" CUI "。\n");

        if (me->query_skill_prepared("strike") != "heisha-zhang")
                return notify_fail("你现在没有准备使用黑砂掌，难以施展" CUI "。\n");

        if ((int)me->query_skill("heisha-zhang", 1) < 100)
                return notify_fail("你的黑砂掌不够熟练，难以施展" CUI "。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内力修为不足，难以施展" CUI "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你的真气不够，难以施展" CUI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIB "$N" HIB "冷笑数声，单掌陡然一振，催魂般悄然拍至$n"
              HIB "前胸，不着半点力道。\n" NOR;  

        lvl = me->query_skill("heisha-zhang", 1);

        ap = me->query_skill("strike");
        dp = target->query_skill("force");

        me->start_busy(3);
        if (ap / 2 + random(ap) > dp)
        { 
                damage = ap / 2 + random(ap / 3);
                me->add("neili", -100);
                target->affect_by("sha_poison",
                               ([ "level" : me->query("jiali") + random(me->query("jiali")),
                                  "id"    : me->query("id"),
                                  "duration" : lvl / 50 + random(lvl / 20) ]));
                                  msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK,
                                         damage, 20, HIR "$n" HIR "只觉$N" HIR "掌劲穿"
                                         "胸而过，一时说不出的难受，呕出一大口黑血。\n"
                                         NOR);
        } else
        {
                msg += CYN "$n" CYN "见$N"
                       CYN "来势汹涌，奋力格挡，终于化解开来。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
