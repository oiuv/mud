#include <ansi.h>
#include <combat.h>

#define BING "「" HIW "冰坚地狱" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp;
        int lvl;

        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/xuantian-zhi/bing"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(BING "只能对战斗中的对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail("你必须空手才能使用" BING "。\n");         

        if (me->query_skill_mapped("finger") != "xuantian-zhi")
                return notify_fail("你没有激发玄天指，不能使用" BING "。\n");

        if (me->query_skill_prepared("finger") != "xuantian-zhi")
                return notify_fail("你现在没有准备使用玄天指，无法使用" BING "。\n");

        if ((int)me->query_skill("xuantian-wujigong", 1) < 180)
                return notify_fail("你的玄天无极功火候不够，使不出" BING "。\n");

        if ((int)me->query_skill("xuantian-zhi", 1) < 180)
                return notify_fail("你的玄天指不够熟练，不会使用" BING "。\n");

        if ((int)me->query("max_neili") < 2000)
                return notify_fail("你的内力修为不足，无法使用" BING "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你的真气不够，无法使用" BING "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "默运玄天无极功，顿时一层寒霜笼罩全身，一声冷"
              "笑，聚力于指，直戳$n" HIW "要穴！\n"NOR;  

        lvl = me->query_skill("xuantian-zhi", 1);

        ap = me->query_skill("finger") + me->query("con") * 5;
        dp = target->query_skill("force") + target->query("con") * 5;

        me->start_busy(4);
        if (ap / 2 + random(ap) > dp)
        { 
                damage = ap + random(ap / 2);
                me->add("neili", -400);
                target->affect_by("xuantian_zhi",
                               ([ "level" : me->query("jiali") + random(me->query("jiali")),
                                  "id"    : me->query("id"),
                                  "duration" : lvl / 50 + random(lvl / 20) ]));
                                  msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK,
                                         damage, 70, HIW "$n" HIW "稍不留神，已被$P" HIW
                                         "一指点中，阴寒之劲顿时侵入三焦六脉。\n" NOR);
        } else
        {
                msg += CYN "$n" CYN "见$N" CYN "来势汹涌，急忙提气跃开。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
