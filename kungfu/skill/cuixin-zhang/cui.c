#include <ansi.h>
#include <combat.h>
 
inherit F_SSERVER;

#define CUI "「" HIW "夺命催心" NOR "」"

int perform(object me)
{
        string msg;
        object /*weapon,*/ target;
        int /*skill,*/ ap, dp;
        int damage, lvl; 

        if (playerp(me) && ! me->query("can_perform/cuixin-zhang/cui"))
                return notify_fail("你使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(CUI "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon"))
                return notify_fail("你必须是空手才能使用！\n");
 
        lvl = me->query_skill("cuixin-zhang", 1);

        if (lvl < 120)
                return notify_fail("你的催心掌还不够纯熟，无法施展" CUI "\n");

        if (me->query_skill("force") < 120)
                return notify_fail("你的内功火候太低，无法使出" CUI "。\n");

        if (me->query("neili") < 500)
                return notify_fail("你的内力不够，无法使出" CUI "。\n");
 
        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "聚气于掌，仰天一声狂啸，刹那间双掌交错，一招"
                  "「夺命催心」带着阴毒内劲直贯$n" HIR "！\n"NOR;

        ap = me->query_skill("strike") + me->query_skill("force");
        dp = target->query_skill("parry") + target->query_skill("force");

        if (dp < 1) dp = 1;

        if ( ap * 11 / 20 + random(ap) > dp)
        {
                me->add("neili", -360);
                damage = ap / 2 + random(ap);

                target->affect_by("cuixin_zhang",
                        ([ "level" : me->query("jiali") + random(me->query("jiali")),
                           "id"    : me->query("id"),
                           "duration" : lvl / 50 + random(lvl / 20) ]));

               msg += COMBAT_D->do_damage(me, target, REMOTE_ATTACK, damage, 70,    
                                          HIR "只听$n" HIR "惨叫一声，只感两耳轰"
                                          "鸣，目不视物，喷出一大口鲜血，软软瘫倒。\n" NOR);

               me->start_busy(2);
        }
        else
        {
               msg += HIY "$p见$P来势汹涌，急忙纵身一跃而起，躲开了这致命的一击！\n" NOR;
               me->add("neili", -200);
               me->start_busy(3);
        }
        message_combatd(msg, me, target);

        return 1;
}
