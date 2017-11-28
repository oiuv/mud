#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        int damage;
        string msg;

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail("双剑合璧只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query_skill("force") < 120)
                return notify_fail("你的内功不够娴熟，不能使用双剑合璧。\n");

        if ((int)me->query_skill("suxin-jian", 1) < 80)
                return notify_fail("你的玉女素心剑不够娴熟，不能使用双剑合璧。\n");

        if ((int)me->query_skill("quanzhen-jian", 1) < 50)
                return notify_fail("你的全真剑法不够娴熟，不能使用双剑合璧。\n");

        if ((int)me->query("neili", 1) < 400)
                return notify_fail("你现在内力太弱，不能使用双剑合璧。\n");

        if (me->query_skill_mapped("sword") != "suxin-jian")
                return notify_fail("你没有激发玉女素心剑，不能使用双剑合璧。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "左手以全真剑法剑意，右手化玉女剑法剑"
              "招，双剑合璧同时刺出。\n" NOR;

        if (random(me->query_skill("force")) > target->query_skill("force") / 2)
        {
                me->start_busy(2);

                damage = (int)me->query_skill("sword", 1) +
                         (int)me->query_skill("quanzhen-jian", 1) +
                         (int)me->query_skill("yunv-jian", 1);

                damage = damage / 2 + random(damage / 2);
                me->add("neili", -350);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 65,
                                           HIR "$n" HIR "看到$N" HIR "双剑飞舞，招式中所有"
                                           "破绽都为另一剑补去，竟不知如何是好！\n"
                                           HIR"一呆之下，$N" HIR "的剑招已经破身而入！$n"
                                           HIR "一声惨叫之下，登时受了重创！\n" NOR);
        } else
        {
                me->start_busy(3);
                msg += CYN "可是$p" NOR CYN "看破了$P" NOR CYN "的企图，将"
                       "自己的全身上下护得密不透风，令$P" NOR CYN "无计可施。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
