#include <ansi.h>
#include <combat.h>

#define DUO "「" HIR "鬼影夺目" NOR "」"

inherit F_SSERVER;

string final(object me, object target, int damage);

int perform(object me, object target)
{
        int damage;
        string msg;
        object weapon;
        int /*lvl,*/ ap, dp;

        if (userp(me) && ! me->query("can_perform/pixie-jian/duo"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(DUO "只能对战斗中的对手使用。\n");

        weapon = me->query_temp("weapon");

        if (weapon && weapon->query("skill_type") != "sword"
           && weapon->query("skill_type") != "pin")
                return notify_fail("你使用的武器不对，难以施展" DUO "。\n");

        if ((int)me->query_skill("pixie-jian", 1) < 80)
                return notify_fail("你的辟邪剑法不够娴熟，难以施展" DUO "。\n");

        if ((int)me->query("max_neili") < 800)
                return notify_fail("你的内力修为不足，难以施展" DUO "。\n");

        if (me->query("neili") < 100)
                return notify_fail("你现在的真气不足，难以施展" DUO "。\n");

        if (weapon && me->query_skill_mapped("sword") != "pixie-jian")
                return notify_fail("你没有准备使用辟邪剑法，难以施展" DUO "。\n");

        if (! weapon && me->query_skill_prepared("unarmed") != "pixie-jian")
                return notify_fail("你没有准备使用辟邪剑法，难以施展" DUO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        if (target->query_temp("block_msg/all"))
	        return notify_fail("对方现在什么也看不见，放胆攻击吧。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
	{
                msg = HIR "$N" HIR "一声阴笑，揉身而上，左手两指并拢，手臂"
                      "暴长，迅捷异常分刺$n" HIR "的双目！\n" NOR;
        } else
	{
                msg = HIR "$N" HIR "一声阴笑，揉身而上，手中" + weapon->name() +
                      HIR "一振，剑尖一点暴长，分刺$n" HIR "左右双目！\n" NOR;
	}

        ap = me->query_skill("sword") +
             me->query_skill("dodge");

        dp = target->query_skill("parry") +
             target->query_skill("dodge");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap);
                msg += COMBAT_D->do_damage(me, target, REMOTE_ATTACK, damage, 30,
                                          (: final, me, target, damage :));
                me->start_busy(2);
                me->add("neili", -80);
        } else
        {
                msg += CYN "$n" CYN "情急智生，抬手也向$N"
                       CYN "的右眼刺去，迫得$P" CYN "回剑跃开。\n" NOR;
                me->start_busy(3);
                me->add("neili", -50);
        }
        message_combatd(msg, me, target);
        return 1;
}

string final(object me, object target, int ap)
{
        target->set_temp("block_msg/all", 1);
        call_out("cimu_end", 10 + random(ap / 30), me, target);
        return HIR "$n" HIR "只觉双目一阵剧痛，眼前一黑，就什么"
               "也看不见了，顿时长声痛极而呼。\n" NOR;
}

void cimu_end(object me, object target)
{
        if (target && target->query_temp("block_msg/all"))
        {
                if (living(target))
                {
                        message_combatd(HIC "$N" HIC "抹了抹流着的"
                                        HIR "鲜血" HIC "，终于能看"
                                        "见了。\n" NOR, target);

                        tell_object(target, HIR "你终于抹掉了眼前的"
                                            "鲜血，能看见了。\n" NOR);
                }
                target->delete_temp("block_msg/all");
	}
	return;
}